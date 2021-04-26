import * as helper from './CipherHelper';

test('encrypt', () => {
  const iv = helper.generateIv();
  const encrypted = helper.encrypt(iv, 'abc', 'abc');
  expect(helper.decrypt(iv, encrypted, 'abc')).toBe('abc');
});
