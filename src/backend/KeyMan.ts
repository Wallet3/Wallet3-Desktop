import * as Cipher from './Cipher';
import * as crypto from 'crypto';
import * as ethers from 'ethers';
import * as keytar from 'keytar';

const Keys = {
  iv: 'iv',
  salt: 'salt',
  password: 'password',
  account: 'master',
  mnemonic: 'mnemonic',
};

const sha256 = (text: string) => crypto.createHash('sha256').update(text).digest().toString('hex');

class KeyMan {
  iv!: string;
  salt!: string;
  tmpMnemonic?: string;

  async init(userPassword: string) {
    this.iv = await keytar.getPassword(Keys.iv, Keys.account);
    this.salt = await keytar.getPassword(Keys.salt, Keys.account);

    if (!(await this.verifyPassword(userPassword))) return false;
  }

  async verifyPassword(userPassword: string) {
    const user = sha256(`${this.salt}-${userPassword}`);
    return user === (await keytar.getPassword(Keys.password, Keys.account));
  }

  genMnemonic(length = 12) {
    const entropy = crypto.randomBytes(length === 12 ? 16 : 32);
    this.tmpMnemonic = ethers.utils.entropyToMnemonic(entropy);

    const wallet = ethers.Wallet.fromMnemonic(this.tmpMnemonic);
    return { mnemonic: this.tmpMnemonic, address: wallet.address };
  }

  async savePassword(userPassword: string) {
    this.iv = await keytar.getPassword(Keys.iv, Keys.account);

    if (!this.iv) {
      this.iv = Cipher.generateIv().toString('hex');
      await keytar.setPassword(Keys.iv, Keys.account, this.iv);
    }

    this.salt = Cipher.generateIv().toString('hex');
    await keytar.setPassword(Keys.salt, Keys.account, this.salt);

    const pwHash = sha256(`${this.salt}-${userPassword}`);
    await keytar.setPassword(Keys.password, Keys.account, pwHash);
  }

  async saveMnemonic(userPassword: string) {
    if (!this.tmpMnemonic) return;

    const password = `${this.salt}-${userPassword}`;
    const encryptedMnemonic = Cipher.encrypt(this.ivBuffer, this.tmpMnemonic, password);

    await keytar.setPassword(Keys.mnemonic, Keys.account, encryptedMnemonic);
  }

  async readMnemonic(userPassword: string) {}

  get ivBuffer() {
    return Buffer.from(this.iv, 'hex');
  }

  get saltBuffer() {
    return Buffer.from(this.salt, 'hex');
  }
}

export default new KeyMan();
