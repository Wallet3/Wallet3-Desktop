import * as helper from './CipherHelper';

test('encrypt', () => {
  const encrypted = helper.encrypt('abc', 'abc');
  expect(helper.decrypt(encrypted, 'abc')).toBe('abc');
});
