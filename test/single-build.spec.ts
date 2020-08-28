import * as assert from 'assert';

import { EtcdMock } from '../src';

/**
 * Created by Rain on 2020/8/28
 */
describe('single build', () => {
  describe('get', () => {
    it('string', async () => {
      const etcd = new EtcdMock();

      await etcd.put('/toonew/ad').value('sx');
      await etcd.put('/toonew/ad2').value('sx');
      const result = await etcd.get('/toonew/ad').string();
      assert.strictEqual(result, 'sx');
    });

    it('json', async () => {
      const etcd = new EtcdMock();

      const testJson = { test: 'test1' };
      await etcd.put('/toonew/ad').value(JSON.stringify(testJson));
      const result = await etcd.get('/toonew/ad').string();
      assert.strictEqual(result, JSON.stringify(testJson));
    });

    it('number', async () => {
      const etcd = new EtcdMock();

      await etcd.put('/toonew/ad').value(1);
      const result = await etcd.get('/toonew/ad').number();
      assert.strictEqual(result, 1);
    });

    it('exists', async () => {
      const etcd = new EtcdMock();

      await etcd.put('/toonew/ad').value(1);
      const result = await etcd.get('/toonew/ad').exists();
      assert.strictEqual(result, true);
    });
  });

  describe('namespace', () => {
    it('string', async () => {
      const etcd = new EtcdMock();

      await etcd.put('/toonew/ad').value('sx');
      const result = await etcd.namespace('/toonew/ad').get('').string();
      assert.strictEqual(result, 'sx');
    });

    it('json', async () => {
      const etcd = new EtcdMock();

      const testJson = { test: 'test1' };
      await etcd.put('/toonew/ad').value(JSON.stringify(testJson));
      const result = await etcd.namespace('/toonew').get('/ad').string();
      assert.strictEqual(result, JSON.stringify(testJson));
    });

    it('number', async () => {
      const etcd = new EtcdMock();

      await etcd.put('/toonew/ad').value(1);
      const result = await etcd.namespace('/toonew').get('/ad').number();
      assert.strictEqual(result, 1);
    });

    it('exists', async () => {
      const etcd = new EtcdMock();

      await etcd.put('/toonew/ad').value(1);
      const result = await etcd.namespace('/toonew').get('/ad').exists();
      assert.strictEqual(result, true);
    });
  });
});
