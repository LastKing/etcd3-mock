import { EtcdMock } from '../src';
import * as assert from 'assert';

/**
 * Created by Rain on 2020/8/28
 */
describe('getAll', () => {
  it('strings', async () => {
    const etcd = new EtcdMock();

    await etcd.put('/toonew/1').value('sx1');
    await etcd.put('/toonew/2').value('sx2');

    const result = await etcd.getAll().prefix('/toonew/').strings();
    assert.deepStrictEqual(result, { '/toonew/1': 'sx1', '/toonew/2': 'sx2' });
    assert.strictEqual(result['/toonew/1'], 'sx1');
  });

  it('jsons', async () => {
    const etcd = new EtcdMock();

    const json1 = { test1: 'test1' };
    const json2 = { test2: 'test2' };
    await etcd.put('/toonew/1').value(JSON.stringify(json1));
    await etcd.put('/toonew/2').value(JSON.stringify(json2));

    const result = await etcd.getAll().prefix('/toonew/').strings();
    assert.deepStrictEqual(result, {
      '/toonew/1': JSON.stringify(json1),
      '/toonew/2': JSON.stringify(json2),
    });
    assert.strictEqual(result['/toonew/1'], JSON.stringify(json1));
  });

  it('numbers', async () => {
    const etcd = new EtcdMock();

    await etcd.put('/toonew/1').value(1);
    await etcd.put('/toonew/2').value(2);

    const result = await etcd.getAll().prefix('/toonew/').numbers();
    assert.deepStrictEqual(result, { '/toonew/1': 1, '/toonew/2': 2 });
    assert.strictEqual(result['/toonew/1'], 1);
  });

  it('keys', async () => {
    const etcd = new EtcdMock();

    await etcd.put('/toonew/1').value('sx1');
    await etcd.put('/toonew/2').value('sx2');

    const result = await etcd.getAll().prefix('/toonew/').keys();
    assert.deepStrictEqual(result, ['/toonew/1', '/toonew/2']);
  });

  it('buffers', async () => {
    const etcd = new EtcdMock();

    await etcd.put('/toonew/1').value('sx1');
    await etcd.put('/toonew/2').value('sx2');

    const result = await etcd.getAll().prefix('/toonew/').buffers();
    assert.deepStrictEqual(result, {
      '/toonew/1': Buffer.from('sx1'),
      '/toonew/2': Buffer.from('sx2'),
    });
    assert.deepStrictEqual(result['/toonew/1'], Buffer.from('sx1'));
  });

  it('count', async () => {
    const etcd = new EtcdMock();

    await etcd.put('/toonew/1').value('sx1');
    await etcd.put('/toonew/2').value('sx2');

    const result = await etcd.getAll().prefix('/toonew/').count();
    assert.deepStrictEqual(result, 2);
  });

  describe('namespace', () => {
    it('strings', async () => {
      const etcd = new EtcdMock();

      await etcd.put('/toonew/1').value('sx1');
      await etcd.put('/toonew/2').value('sx2');

      const result = await etcd.namespace('/toonew/').getAll().prefix('').strings();
      assert.deepStrictEqual(result, { '1': 'sx1', '2': 'sx2' });
      assert.strictEqual(result['1'], 'sx1');
    });

    it('keys', async () => {
      const etcd = new EtcdMock();

      await etcd.put('/toonew/1').value('sx1');
      await etcd.put('/toonew/2').value('sx2');

      const result = await etcd.namespace('/toonew/').getAll().prefix('').keys();
      assert.deepStrictEqual(result, ['1', '2']);
    });
  });
});
