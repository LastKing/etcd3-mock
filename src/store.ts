/**
 * Created by Rain on 2020/8/28
 */
import { IRangeRequest, IRangeResponse } from 'etcd3';
import { IKeyValue } from 'etcd3/lib/rpc';

export class Store {
  private readonly cache: Map<string, Buffer> = new Map<string, Buffer>();

  setCache(key: Buffer, value: Buffer): void {
    this.cache.set(key.toString(), value);
  }

  async getCache(key: Buffer): Promise<IRangeResponse> {
    if (key[key.length - 1] === 0) {
      key = key.slice(0, key.length - 1);
    }

    const keyString = key.toString();

    if (!this.cache.get(keyString)) {
      return {
        header: null,
        kvs: [],
        more: false,
        count: '0',
      };
    } else {
      return {
        header: null,
        kvs: [
          {
            key,
            create_revision: '1',
            mod_revision: '1',
            version: '1',
            value: this.cache.get(key.toString()),
            lease: 'less',
          },
        ],
        more: false,
        count: '1',
      };
    }
  }

  async range(
    request: IRangeRequest,

    grpcOption: any,
  ): Promise<IRangeResponse> {
    const matchKeys: string[] = [];

    if (request.key[request.key.length - 1] === 0) {
      request.key = request.key.slice(0, request.key.length - 1);
    }

    const requestKey: string = request.key.toString();

    const kvs: IKeyValue[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(requestKey)) {
        matchKeys.push(key);
        kvs.push({
          key: Buffer.from(key),
          create_revision: '1',
          mod_revision: '1',
          version: '1',
          value: this.cache.get(key),
          lease: 'less',
        });
      }
    }

    return {
      header: null,
      kvs,
      more: false,
      count: matchKeys.length + '',
    };
  }
}
