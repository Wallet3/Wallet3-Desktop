import * as Cipher from '../common/Cipher';
import * as crypto from 'crypto';
import * as ethSignUtil from 'eth-sig-util';
import * as ethers from 'ethers';
import * as keytar from 'keytar';

import Account, { AccountType } from './models/Account';

import DBMan from './DBMan';
import { TxParams } from '../common/Messages';

const BasePath = `m/44\'/60\'/0\'/0`;

const Keys = {
  password: 'wallet3-password',
  account: 'wallet3-master',
};

export function setTest() {
  Keys.account = 'test';
}

const sha256 = (text: string) => crypto.createHash('sha256').update(text).digest().toString('hex');

class KeyMan {
  salt!: string;
  tmpMnemonic?: string;
  basePath = BasePath;
  pathIndex = 0;
  hasSecret = false;

  account: Account;

  async init(accountId = 0) {
    this.account = await DBMan.accountRepo.findOne(accountId);

    this.salt = this.account?.salt;
    this.hasSecret = this.account?.secret && this.account?.iv && this.salt ? true : false;
    this.basePath = this.account?.basePath ?? BasePath;
    this.pathIndex = this.account?.basePathIndex ?? 0;
  }

  async setFullPath(fullPath: string) {
    const lastSlash = fullPath.lastIndexOf('/');
    this.basePath = fullPath.substring(0, lastSlash);
    this.pathIndex = Number.parseInt(fullPath.substring(lastSlash + 1)) || 0;

    this.account.basePath = this.basePath;
    this.account.basePathIndex = this.pathIndex;
    await this.account.save();
  }

  async verifyPassword(userPassword: string) {
    const user = sha256(this.getCorePassword(userPassword));
    return user === (await keytar.getPassword(Keys.password, Keys.account));
  }

  async savePassword(userPassword: string) {
    this.salt = Cipher.generateIv().toString('hex');

    this.account = this.account ?? new Account();
    this.account.salt = this.salt;
    await this.account.save();

    const pwHash = sha256(this.getCorePassword(userPassword));
    await keytar.setPassword(Keys.password, Keys.account, pwHash);
  }

  genMnemonic(length = 12) {
    const entropy = crypto.randomBytes(length === 12 ? 16 : 32);
    this.tmpMnemonic = ethers.utils.entropyToMnemonic(entropy);

    const wallet = ethers.Wallet.fromMnemonic(this.tmpMnemonic);
    return { mnemonic: this.tmpMnemonic, address: wallet.address };
  }

  setTmpMnemonic(mnemonic: string) {
    if (!ethers.utils.isValidMnemonic(mnemonic)) return;
    this.tmpMnemonic = mnemonic;
  }

  async saveMnemonic(userPassword: string) {
    if (!this.tmpMnemonic) return false;
    if (!ethers.utils.isValidMnemonic(this.tmpMnemonic)) return false;
    if (!(await this.verifyPassword(userPassword))) return false;

    const iv = Cipher.generateIv();
    const encryptedMnemonic = Cipher.encrypt(iv, this.tmpMnemonic, this.getCorePassword(userPassword));

    this.account.secret = encryptedMnemonic;
    this.account.iv = iv.toString('hex');
    this.account.type = AccountType.mnemonic;
    this.account.save();

    this.tmpMnemonic = undefined;
    this.hasSecret = true;

    return true;
  }

  async readMnemonic(userPassword: string) {
    if (!(await this.verifyPassword(userPassword))) return undefined;

    const iv = this.account.iv;
    const enMnemonic = this.account.secret;

    return Cipher.decrypt(Buffer.from(iv, 'hex'), enMnemonic, this.getCorePassword(userPassword));
  }

  async signTx(userPassword: string, accountIndex = 0, txParams: TxParams) {
    const privKey = await this.getPrivateKey(userPassword, accountIndex);
    if (!privKey) return '';

    const signer = new ethers.Wallet(privKey);
    return await signer.signTransaction({
      to: txParams.to,
      chainId: txParams.chainId,
      data: txParams.data,
      nonce: txParams.nonce,
      gasLimit: ethers.BigNumber.from(txParams.gas),
      gasPrice: ethers.BigNumber.from(txParams.gasPrice),
      value: ethers.BigNumber.from(txParams.value),
    });
  }

  async personalSignMessage(userPassword: string, accountIndex = 0, msg: string | ethers.utils.Bytes) {
    const privKey = await this.getPrivateKey(userPassword, accountIndex);
    if (!privKey) return '';

    const signer = new ethers.Wallet(privKey);
    return await signer.signMessage(typeof msg === 'string' ? ethers.utils.arrayify(msg) : msg);
  }

  async signTypedData_v4(userPassword: string, accountIndex = 0, typedData: any) {
    const privKey = await this.getPrivateKey(userPassword, accountIndex);
    if (!privKey) return '';

    return ethSignUtil.signTypedData_v4(Buffer.from(ethers.utils.arrayify(privKey)), { data: typedData });
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

  async reset(password: string) {
    if (!(await this.verifyPassword(password))) return false;

    this.salt = undefined;
    this.hasSecret = false;
    this.basePath = BasePath;
    this.pathIndex = 0;

    await this.account?.remove();
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
