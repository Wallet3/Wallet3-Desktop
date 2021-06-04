import * as helper from './Cipher';

test('encrypt', () => {
  const [iv, encrypted] = helper.encrypt('abc', 'abc');
  expect(helper.decrypt(iv, encrypted, 'abc')).toBe('abc');
});

test('encrypt by buffer', () => {
  const pw = helper.generateIv();
  const [iv, encrypted] = helper.encrypt('abc', pw);
  expect(helper.decrypt(iv, encrypted, pw)).toBe('abc');
});

test('wrong password', () => {
  const pw1 = helper.generateIv();
  const pw2 = helper.generateIv();
  const [iv, encrypted] = helper.encrypt('aaa', pw1);
  expect(helper.decrypt(iv, encrypted, pw2)).not.toBe('aaa');
});
