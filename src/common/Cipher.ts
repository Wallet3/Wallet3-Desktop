import crypto from 'crypto';

const algorithm = 'aes-256-ctr';

export function generateIv(size = 16): Buffer {
  return crypto.randomBytes(size);
}

export function encrypt(iv: Buffer, text: string, password: string | Buffer): string {
  const pw = crypto.createHash('sha512').update(password).digest().subarray(0, 32);
  const cipher = crypto.createCipheriv(algorithm, pw, iv);
  let enc = cipher.update(text, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
}

export function decrypt(iv: Buffer, encrypted: string, password: string | Buffer): string {
  const pw = crypto.createHash('sha512').update(password).digest().subarray(0, 32);
  const decipher = crypto.createDecipheriv(algorithm, pw, iv);
  let dec = decipher.update(encrypted, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}
