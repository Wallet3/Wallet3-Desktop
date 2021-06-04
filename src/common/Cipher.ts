import crypto from 'crypto';

const algorithm = 'aes-256-ctr';

export function generateIv(size = 16): Buffer {
  return crypto.randomBytes(size);
}

export function encrypt(text: string, password: string | Buffer, iv: Buffer = undefined): [iv: string, cipher: string] {
  iv = iv ?? generateIv(16);
  const pw = sha256(sha512(password));
  const cipher = crypto.createCipheriv(algorithm, pw, iv);
  let enc = cipher.update(text, 'utf8', 'hex');
  enc += cipher.final('hex');
  return [iv.toString('hex'), enc];
}

export function decrypt(iv: Buffer | string, encrypted: string, password: string | Buffer): string {
  const pw = sha256(sha512(password));
  const decipher = crypto.createDecipheriv(algorithm, pw, typeof iv === 'string' ? Buffer.from(iv, 'hex') : iv);
  let dec = decipher.update(encrypted, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

export const sha256 = (text: string | Buffer) => crypto.createHash('sha256').update(text).digest();

export const sha512 = (text: string | Buffer) => crypto.createHash('sha512').update(text).digest();
