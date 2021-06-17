import * as Cipher from '../common/Cipher';
import * as crypto from 'crypto';
import * as ethSignUtil from 'eth-sig-util';
import * as ethers from 'ethers';
import * as keytar from 'keytar';

import Key, { AccountType } from './models/Key';

import DBMan from './DBMan';
import { TxParams } from '../common/Messages';

const BasePath = `m/44\'/60\'/0\'/0`;
const prod = process.env.NODE_ENV === 'production';

const Keys = {
  password: 'wallet3-password',
  secret: 'wallet3-secret',
  masterAccount: (machine_id: string) => (prod ? `wallet3-master-${machine_id}` : `wallet3-dev-master-${machine_id}`),
  secretAccount: (kc_unique: string) => (prod ? `wallet3-account-${kc_unique}` : `wallet3-dev-account-${kc_unique}`),
};

class KeyMan {
  tmpMnemonic?: string;
  basePath = BasePath;
  basePathIndex = 0;
  hasSecret = false;

  key: Key;

  async init(accountId = 1) {
    [this.key] = await DBMan.accountRepo.find();

    this.basePath = this.key?.basePath ?? BasePath;
    this.basePathIndex = this.key?.basePathIndex ?? 0;

    this.hasSecret =
      this.key?.kc_unique && this.key?.mnIv
        ? (await keytar.getPassword(Keys.secret, Keys.secretAccount(this.key.kc_unique)))
          ? true
          : false
        : false;
  }

  async setFullPath(fullPath: string) {
    const lastSlash = fullPath.lastIndexOf('/');
    this.basePath = fullPath.substring(0, lastSlash);
    this.basePathIndex = Number.parseInt(fullPath.substring(lastSlash + 1)) || 0;

    if (!this.key) return;

    this.key.basePath = this.basePath;
    this.key.basePathIndex = this.basePathIndex;
    await this.key.save();
  }

  async verifyPassword(userPassword: string) {
    try {
      const user = Cipher.sha256(this.getCorePassword(userPassword)).toString('hex');
      return user === (await keytar.getPassword(Keys.password, Keys.masterAccount('default')));
    } catch (error) {
      console.error(error.message);
      return false;
    }
  }

  async savePassword(userPassword: string) {
    const [saltIv, salt] = Cipher.encrypt(Cipher.generateIv().toString('hex'), userPassword);
    this.key = this.key ?? new Key();
    this.key.saltIv = saltIv;
    this.key.salt = salt;

    await this.key.save();

    const pwHash = Cipher.sha256(this.getCorePassword(userPassword)).toString('hex');
    await keytar.setPassword(Keys.password, Keys.masterAccount('default'), pwHash);
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

    this.key.kc_unique = this.key.kc_unique ?? crypto.randomBytes(4).toString('hex');
    this.key.type = AccountType.mnemonic;
    this.key.basePath = this.basePath;
    this.key.basePathIndex = this.basePathIndex;

    const [mnIv, encryptedMnemonic] = Cipher.encrypt(this.tmpMnemonic, this.getCorePassword(userPassword));
    this.key.mnIv = mnIv;

    await this.key.save();
    await keytar.setPassword(Keys.secret, Keys.secretAccount(this.key.kc_unique), encryptedMnemonic);

    this.tmpMnemonic = undefined;
    this.hasSecret = true;

    return true;
  }

  async readMnemonic(userPassword: string) {
    if (!(await this.verifyPassword(userPassword))) return undefined;

    try {
      const iv = this.key.mnIv;
      const enMnemonic = await keytar.getPassword(Keys.secret, Keys.secretAccount(this.key.kc_unique));

      return Cipher.decrypt(Buffer.from(iv, 'hex'), enMnemonic, this.getCorePassword(userPassword));
    } catch (error) {
      console.error(error.message);
      return undefined;
    }
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
    const addresses = [hd.derivePath(`${this.basePath}/${this.basePathIndex}`).address];

    for (let i = 1; i < count; i++) {
      addresses.push(hd.derivePath(`${this.basePath}/${this.basePathIndex + i}`).address);
    }

    return addresses;
  }

  async reset(password: string, viaPassword = true) {
    if (viaPassword && !(await this.verifyPassword(password))) return false;

    this.hasSecret = false;
    this.basePath = BasePath;
    this.basePathIndex = 0;

    await keytar.deletePassword(Keys.secret, Keys.secretAccount(this.key.kc_unique));
    await this.key?.remove();

    this.key = undefined;
  }

  private async getPrivateKey(userPassword: string, accountIndex = 0) {
    const mnemonic = await this.readMnemonic(userPassword);
    if (!mnemonic) return undefined;

    const root = ethers.utils.HDNode.fromMnemonic(mnemonic);
    const account = root.derivePath(`${this.basePath}/${this.basePathIndex + accountIndex}`);
    return account.privateKey;
  }

  private getCorePassword(userPassword: string) {
    const salt = Cipher.decrypt(Buffer.from(this.key.saltIv, 'hex'), this.key.salt, userPassword);
    return `${salt}-${userPassword}`;
  }
}

export default new KeyMan();
