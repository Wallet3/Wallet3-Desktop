import * as helper from '../common/Cipher';

test('encrypt', () => {
  const iv = helper.generateIv();
  const encrypted = helper.encrypt(iv, 'abc', 'abc');
  expect(helper.decrypt(iv, encrypted, 'abc')).toBe('abc');
});

test('encrypt by buffer', () => {
  const iv = helper.generateIv();
  const pw = helper.generateIv();
  const encrypted = helper.encrypt(iv, 'abc', pw);
  expect(helper.decrypt(iv, encrypted, pw)).toBe('abc');
});

test('wrong password', () => {
  const iv = helper.generateIv();
  const pw1 = helper.generateIv();
  const pw2 = helper.generateIv();
  const encrypted = helper.encrypt(iv, 'aaa', pw1);
  expect(helper.decrypt(iv, encrypted, pw2)).not.toBe('aaa');
});
