import { NSApplicator, toBuffer } from 'etcd3/lib/util';

import * as Builder from './builder';
import { Store } from './store';
import { WatchBuilder } from './watch';

/**
 * Created by Rain on 2020/8/28
 */
export class Namespace {
  private readonly nsApplicator = new NSApplicator(this.prefix || toBuffer(''));

  constructor(
    protected readonly prefix?: Buffer,
    private readonly store?: Store,
  ) {
    this.store = store || new Store();
  }

  /**
   * `.put()` starts making a put request against etcd.
   */
  public put(key: string | Buffer): Builder.PutBuilder {
    return new Builder.PutBuilder(this.store, key);
  }

  public get(key: string | Buffer): Builder.SingleRangeBuilder {
    return new Builder.SingleRangeBuilder(this.store, this.nsApplicator, key);
  }

  public getAll(): Builder.MultiRangeBuilder {
    return new Builder.MultiRangeBuilder(this.store, this.nsApplicator);
  }

  public namespace(prefix: string | Buffer): Namespace {
    return new Namespace(Buffer.concat([this.prefix, toBuffer(prefix)]), this.store);
  }

  public watch(): WatchBuilder {
    return new WatchBuilder();
  }
}
