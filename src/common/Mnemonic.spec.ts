import * as ethers from 'ethers';

import { langToWordlist } from './Mnemonic';

test('chinese test', () => {
  const s = '泰 浸 钉 信 堵 连 掌 仲 司 硬 桥 勾';
  const wl = langToWordlist(s);
  console.log(wl, wl.getWord(5));
  expect(wl).toStrictEqual(ethers.wordlists.zh);
});
