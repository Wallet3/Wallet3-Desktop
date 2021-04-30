import * as ethers from 'ethers';

const mnemonic = 'afford candy jewel raven version roast unfair female diary render buffalo buddy comic mimic control';

test('derive path', () => {
  const hd = ethers.utils.HDNode.fromMnemonic(mnemonic);

  const no2 = hd.derivePath(`m/44'/60'/0'/0/2`);
  expect(no2.address).toEqual('0xB842b2cAA21579FFE5A6865821a9b6284b6966de');
});
