import * as Cipher from '../common/Cipher';
import * as crypto from 'crypto';
import * as ethers from 'ethers';
import * as keytar from 'keytar';

const Keys = {
  salt: 'salt',
  password: 'password',
  path: 'path',
  account: 'master',
  mnemonic: 'mnemonic',
};

const sha256 = (text: string) => crypto.createHash('sha256').update(text).digest().toString('hex');

class KeyMan {
  salt!: string;
  tmpMnemonic?: string;
  path = `m/44'/60'/0'/0`;

  private getCorePassword(userPassword: string) {
    return `${this.salt}-${userPassword}`;
  }

  async init() {
    this.salt = await keytar.getPassword(Keys.salt, Keys.account);
  }

  async verifyPassword(userPassword: string) {
    const user = sha256(this.getCorePassword(userPassword));
    return user === (await keytar.getPassword(Keys.password, Keys.account));
  }

  genMnemonic(length = 12) {
    const entropy = crypto.randomBytes(length === 12 ? 16 : 32);
    this.tmpMnemonic = ethers.utils.entropyToMnemonic(entropy);

    const wallet = ethers.Wallet.fromMnemonic(this.tmpMnemonic);
    return { mnemonic: this.tmpMnemonic, address: wallet.address };
  }

  async savePassword(userPassword: string) {
    this.salt = Cipher.generateIv().toString('hex');
    await keytar.setPassword(Keys.salt, Keys.account, this.salt);

    const pwHash = sha256(this.getCorePassword(userPassword));
    await keytar.setPassword(Keys.password, Keys.account, pwHash);
  }

  async saveMnemonic(userPassword: string) {
    if (!this.tmpMnemonic) return false;
    if (!ethers.utils.isValidMnemonic(this.tmpMnemonic)) return false;
    if (!(await this.verifyPassword(userPassword))) return false;

    const iv = Cipher.generateIv();
    const encryptedMnemonic = Cipher.encrypt(iv, this.tmpMnemonic, this.getCorePassword(userPassword));

    await keytar.setPassword(Keys.mnemonic, Keys.account, `${iv.toString('hex')}:${encryptedMnemonic}`);
    this.tmpMnemonic = undefined;

    return true;
  }

  async readMnemonic(userPassword: string) {
    if (!(await this.verifyPassword(userPassword))) return undefined;

    const formatted = await keytar.getPassword(Keys.mnemonic, Keys.account);
    const [iv, enMnemonic] = formatted.split(':');

    return Cipher.decrypt(Buffer.from(iv, 'hex'), enMnemonic, this.getCorePassword(userPassword));
  }

  setTmpMnemonic(mnemonic: string) {
    if (!ethers.utils.isValidMnemonic(mnemonic)) return;
    this.tmpMnemonic = mnemonic;
  }

  async genAddresses(userPassword: string, count: number) {
    const mnemonic = await this.readMnemonic(userPassword);
    if (!mnemonic) return undefined;

    const hd = ethers.utils.HDNode.fromMnemonic(mnemonic);
    const addresses = [hd.address];

    for (let i = 1; i < count; i++) {
      addresses.push(hd.derivePath(`${this.path}/${i}`).address);
    }

    return addresses;
  }

  reset(password: string) {
    this.salt = undefined;
    [Keys.mnemonic, Keys.salt, Keys.mnemonic].forEach((key) => keytar.deletePassword(key, Keys.account));
  }
}

export default new KeyMan();
