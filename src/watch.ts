/**
 * Created by Rain on 2020/8/28
 */
import { EventEmitter } from 'events';

import { EtcdError } from 'etcd3';

export class WatchBuilder {
  key(key: string | Buffer): this {
    return this;
  }

  prefix(value: string | Buffer): this {
    return this;
  }

  create(): Promise<Watch> {
    return Promise.resolve(new Watch());
  }
}

export class Watch extends EventEmitter {
  public on(event: 'connecting', handler: (req: any) => void): this;
  public on(event: 'connected', handler: (res: any) => void): this;

  public on(event: 'data', handler: (res: any) => void): this;
  public on(event: 'put', handler: (kv: any, previous?: any) => void): this;

  public on(event: 'delete', handler: (kv: any, previous?: any) => void): this;
  public on(event: 'end', handler: () => void): this;
  public on(event: 'disconnected', handler: (res: EtcdError) => void): this;
  public on(event: 'error', handler: (err: EtcdError) => void): this;
  public on(event: string, handler: (...args: any[]) => void): this {
    return super.on(event, handler);
  }
}
