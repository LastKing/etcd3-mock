/**
 * Created by Rain on 2020/8/28
 */
import { Namespace } from './namespace';

export class EtcdMock extends Namespace {
  constructor() {
    super(Buffer.from([]));
  }
}
