import * as helper from './Cipher';

test('encrypt', () => {
  const iv = helper.generateIv();
  const encrypted = helper.encrypt(iv, 'abc', 'abc');
  expect(helper.decrypt(iv, encrypted, 'abc')).toBe('abc');
});
