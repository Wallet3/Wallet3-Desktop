import * as Cipher from '../common/Cipher';
import * as crypto from 'crypto';
import * as ethers from 'ethers';
import * as keytar from 'keytar';

import { TxParams } from '../common/Messages';

const Keys = {
  salt: 'salt',
  password: 'password',
  basePath: 'basePath',
  pathIndex: 'pathIndex',
  account: 'master',
  mnemonic: 'mnemonic',
};

const sha256 = (text: string) => crypto.createHash('sha256').update(text).digest().toString('hex');

class KeyMan {
  salt!: string;
  tmpMnemonic?: string;
  basePath = `m/44'/60'/0'/0`;
  pathIndex = 0;
  hasMnemonic = false;

  async init() {
    this.salt = await keytar.getPassword(Keys.salt, Keys.account);
    this.hasMnemonic = (await keytar.getPassword(Keys.mnemonic, Keys.account)) ? true : false;
    this.basePath = (await keytar.getPassword(Keys.basePath, Keys.account)) || `m/44'/60'/0'/0`;
    this.pathIndex = Number.parseInt((await keytar.getPassword(Keys.pathIndex, Keys.account)) || '0');

    console.log(this.salt, this.hasMnemonic, this.basePath, this.pathIndex);
  }

  async verifyPassword(userPassword: string) {
    const user = sha256(this.getCorePassword(userPassword));
    return user === (await keytar.getPassword(Keys.password, Keys.account));
  }

  async setFullPath(fullPath: string) {
    const lastSlash = fullPath.lastIndexOf('/');
    this.basePath = fullPath.substring(0, lastSlash);
    this.pathIndex = Number.parseInt(fullPath.substring(lastSlash + 1)) || 0;

    await keytar.setPassword(Keys.basePath, Keys.account, this.basePath);
    await keytar.setPassword(Keys.pathIndex, Keys.account, `${this.pathIndex}`);
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
    this.hasMnemonic = true;

    return true;
  }

  async readMnemonic(userPassword: string) {
    if (!(await this.verifyPassword(userPassword))) return undefined;

    const formatted = await keytar.getPassword(Keys.mnemonic, Keys.account);
    const [iv, enMnemonic] = formatted.split(':');

    return Cipher.decrypt(Buffer.from(iv, 'hex'), enMnemonic, this.getCorePassword(userPassword));
  }

  async signTx(userPassword: string, accountIndex = 0, txParams: TxParams) {
    const privKey = await this.getPrivateKey(userPassword, accountIndex);
    if (!privKey) return '';

    const signer = new ethers.Wallet(privKey);
    return await signer.signTransaction(txParams);
  }

  async signMessage(userPassword: string, accountIndex = 0, msg: string | ethers.utils.Bytes) {
    const privKey = await this.getPrivateKey(userPassword, accountIndex);
    if (!privKey) return '';

    const signer = new ethers.Wallet(privKey);
    return await signer.signMessage(typeof msg === 'string' ? ethers.utils.arrayify(msg) : msg);
  }

  setTmpMnemonic(mnemonic: string) {
    if (!ethers.utils.isValidMnemonic(mnemonic)) return;
    this.tmpMnemonic = mnemonic;
  }

  async genAddresses(userPassword: string, count: number) {
    const mnemonic = await this.readMnemonic(userPassword);
    if (!mnemonic) return undefined;

    const hd = ethers.utils.HDNode.fromMnemonic(mnemonic);
    const addresses = [hd.derivePath(`${this.basePath}/${this.pathIndex}`).address];

    for (let i = 1; i < count; i++) {
      addresses.push(hd.derivePath(`${this.basePath}/${this.pathIndex + i}`).address);
    }

    return addresses;
  }

  reset(password: string) {
    this.salt = undefined;
    this.hasMnemonic = false;
    this.basePath = `m/44'/60'/0'/0`;
    this.pathIndex = 0;

    const tasks = [Keys.mnemonic, Keys.salt, Keys.mnemonic, Keys.basePath, Keys.pathIndex].map((key) =>
      keytar.deletePassword(key, Keys.account)
    );

    return Promise.all(tasks);
  }

  private async getPrivateKey(userPassword: string, accountIndex = 0) {
    const mnemonic = await this.readMnemonic(userPassword);
    if (!mnemonic) return undefined;

    const root = ethers.utils.HDNode.fromMnemonic(mnemonic);
    const account = root.derivePath(`${this.basePath}/${this.pathIndex + accountIndex}`);
    return account.privateKey;
  }

  private getCorePassword(userPassword: string) {
    return `${this.salt}-${userPassword}`;
  }
}

export default new KeyMan();
