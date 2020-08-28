# etcd3-mock

## example

```typescript
import { EtcdMock } from 'etcd3-mock';

const etcd3 = new Etcd3Mock();

async function main() {
  await etcd.put('/toonew/1').value('sx1');
  await etcd.put('/toonew/2').value('sx2');

  const result = await etcd.getAll().prefix('/toonew/').strings();
  console.info(result);
}
```

the mock just implement simple api. if u need more api support please input issues or pr.

哈哈！~！~

if use the library in typescript code. need `Etcd3Mock as Etcd3`


## License

Nest is [MIT licensed](LICENSE).
