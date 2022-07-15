/**
 * Created by Rain on 2020/8/28
 */
import {
  IPutRequest,
  IRangeRequest,
  IRangeResponse,
  Rangable,
  Range,
  SortOrder,
  SortTarget,
} from 'etcd3';
import * as RPC from 'etcd3/lib/rpc';
import { NSApplicator, PromiseWrap, toBuffer } from 'etcd3/lib/util';

import { Store } from './store';

const emptyBuffer = Buffer.from([]);

function assertWithin<T>(map: T, value: keyof T, thing: string) {
  if (!(value in map)) {
    const keys = Object.keys(map).join('" "');
    throw new Error(`Unexpected "${value.toString()}" in ${thing}. Possible values are: "${keys}"`);
  }
}

export class MultiRangeBuilder extends PromiseWrap<any> {
  protected request: IRangeRequest = {};

  constructor(private readonly store: Store, private readonly namespace: NSApplicator) {
    super();
    this.prefix(emptyBuffer);
  }

  /**
   * Prefix instructs the query to scan for all keys that have the provided
   * prefix.
   */
  public prefix(value: string | Buffer): this {
    return this.inRange(Range.prefix(value));
  }

  /**
   * inRange instructs the builder to get keys in the specified byte range.
   */
  public inRange(r: Rangable): this {
    const range = Range.from(r);
    this.request.key = range.start;
    this.request.range_end = range.end;
    return this;
  }

  /**
   * All will instruct etcd to get all keys.
   */
  public all(): this {
    return this.prefix('');
  }

  /**
   * Limit sets the maximum number of results to retrieve.
   */
  public limit(count: number): this {
    this.request.limit = isFinite(count) ? count : 0;
    return this;
  }

  /**
   * Sort specifies how the result should be sorted.
   */
  public sort(target: keyof typeof SortTarget, order: keyof typeof SortOrder): this {
    assertWithin(RPC.SortTarget, target, 'sort order in client.get().sort(...)');
    assertWithin(RPC.SortOrder, order, 'sort order in client.get().sort(...)');
    this.request.sort_target = RPC.SortTarget[target];
    this.request.sort_order = RPC.SortOrder[order];
    return this;
  }

  /**
   * count returns the number of keys that match the query.
   */
  public count(): Promise<number> {
    this.request.count_only = true;
    return this.exec().then(res => Number(res.count));
  }

  /**
   * Keys returns an array of keys matching the query.
   */
  public keys(encoding: BufferEncoding = 'utf8'): Promise<string[]> {
    this.request.keys_only = true;
    return this.exec().then(res => {
      return res.kvs.map(kv => kv.key.toString(encoding));
    });
  }

  /**
   * Keys returns an array of keys matching the query, as buffers.
   */
  public keyBuffers(): Promise<Buffer[]> {
    this.request.keys_only = true;
    return this.exec().then(res => {
      return res.kvs.map(kv => kv.key);
    });
  }

  /**
   * Runs the built request and parses the returned keys as JSON.
   */
  public json(): Promise<{ [key: string]: unknown }> {
    return this.mapValues(buf => JSON.parse(buf.toString()));
  }

  /**
   * Runs the built request and returns the value of the returned key as a
   * string, or `null` if it isn't found.
   */
  public strings(encoding: BufferEncoding = 'utf8'): Promise<{ [key: string]: string }> {
    return this.mapValues(buf => buf.toString(encoding));
  }

  /**
   * Runs the built request and returns the values of keys as numbers. May
   * resolve to NaN if the keys do not contain numbers.
   */
  public numbers(): Promise<{ [key: string]: number }> {
    return this.mapValues(buf => Number(buf.toString()));
  }

  /**
   * Runs the built request and returns the value of the returned key as a
   * buffers.
   */
  public buffers(): Promise<{ [key: string]: Buffer }> {
    return this.mapValues(b => b);
  }

  /**
   * Runs the built request and returns the raw response from etcd.
   */
  public exec(): Promise<IRangeResponse> {
    return this.store.range(this.namespace.applyToRequest(this.request), {} as any).then(res => {
      for (const kv of res.kvs) {
        kv.key = this.namespace.unprefix(kv.key);
      }

      return res;
    });
  }

  /**
   * @override
   */
  protected createPromise(): Promise<{ [key: string]: string }> {
    return this.strings();
  }

  /**
   * Dispatches a call to the server, and creates a map by running the
   * iterator over the values returned.
   */
  private mapValues<T>(iterator: (buf: Buffer) => T): Promise<{ [key: string]: T }> {
    return this.exec().then(res => {
      const output: { [key: string]: T } = {};
      for (const kv of res.kvs) {
        output[kv.key.toString()] = iterator(kv.value);
      }

      return output;
    });
  }
}

export class SingleRangeBuilder {
  protected request: IRangeRequest = {};

  constructor(
    private readonly store: Store,
    private readonly namespace: NSApplicator,
    key: string | Buffer,
  ) {
    this.request.key = toBuffer(key);
  }

  public json(): Promise<unknown> {
    return this.string().then(JSON.parse);
  }

  public string(encoding: BufferEncoding = 'utf8'): Promise<string | null> {
    return this.exec().then(res =>
      res.kvs.length === 0 ? null : res.kvs[0].value.toString(encoding),
    );
  }

  public number(): Promise<number | null> {
    return this.string().then(value => (value === null ? null : Number(value)));
  }

  public buffer(): Promise<Buffer | null> {
    return this.exec().then(res => (res.kvs.length === 0 ? null : res.kvs[0].value));
  }

  public exists(): Promise<boolean> {
    this.request.keys_only = true;
    return this.exec().then(r => r.count !== '0');
  }

  exec(): Promise<IRangeResponse> {
    return this.store.range(this.namespace.applyToRequest(this.request), {} as any);
  }

  then(): any {
    return this.exec();
  }
}

export class PutBuilder extends PromiseWrap<any> {
  private readonly request: IPutRequest = {};

  constructor(private readonly store: Store, key: string | Buffer) {
    super();
    this.request.key = toBuffer(key);
    return this;
  }

  public value(value: string | Buffer | number): this {
    this.request.value = toBuffer(value);
    return this;
  }

  public exec(): void {
    this.store.setCache(this.request.key, this.request.value);
  }

  protected createPromise(): Promise<void> {
    this.exec();
    return Promise.resolve(null);
  }
}
