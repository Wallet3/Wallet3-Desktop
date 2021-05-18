import * as helper from './Cipher';

import sodium from 'libsodium-wrappers';

test('random', async () => {
  await sodium.ready;
  console.log(sodium.crypto_secretstream_xchacha20poly1305_keygen());
  const sodBuf = sodium.randombytes_buf(32);
  const buf = Buffer.from(sodBuf);
  console.log(sodBuf);
  console.log(buf);
  console.log(buf.toString('hex'));

  expect(buf.length).toBe(32);
});

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
