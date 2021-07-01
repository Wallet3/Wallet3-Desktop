import * as ethers from 'ethers';

import WalletKey from './WalletKey';

const mnemonic = 'afford candy jewel raven version roast unfair female diary render buffalo buddy comic mimic control';

test('derive path', () => {
  const hd = ethers.utils.HDNode.fromMnemonic(mnemonic);

  const no2 = hd.derivePath(`m/44'/60'/0'/0/2`);
  expect(no2.address).toEqual('0xB842b2cAA21579FFE5A6865821a9b6284b6966de');
});

test('personal_sign', () => {
  const hd = ethers.utils.HDNode.fromMnemonic(mnemonic);
  const no3 = hd.derivePath(`m/44'/60'/0'/0/3`);

  expect(no3.address).toEqual('0x211593b7E9446220C4F77fa844faa9beB28307F0');
  expect(no3.privateKey).toEqual('0xac0f53728b8244fc7d05ad661c73020757b95a9bdb5f1784e5f19013f4c82ab4');

  // const w = new ethers.Wallet(no3.privateKey);
  // w.signMessage('')
});

test(
  'custom path',
  async () => {
    WalletKey.setTmpSecret(
      'become replace lecture bleak reform topple fringe menu original damage equip crime sorry alarm erase'
    );

    WalletKey.setFullPath(`m/44'/60'/5'/2/0`);
    expect(WalletKey.basePath).toBe(`m/44'/60'/5'/2`);
    expect(WalletKey.basePathIndex).toBe(0);

    const addresses = await WalletKey.genAddresses('111222', 5);

    const expected = [
      '0x887845B5598558265a53C32a7920E010359E7C58',
      '0x0076717B5DaEE2b916c4d6cBfedd6c7b7d95f516',
      '0x8726E4b7C1D3934959815D5A3c3e029592d4EbFe',
      '0x0C4D43C7628fdeAdA55bf3b0074DC96DD8Bd3214',
      '0x9B91bb8f3eFF34Ae2e5AAFA88d41D12d3121389b',
    ];

    expect(addresses).toStrictEqual(expected);
  },
  1000 * 1000
);