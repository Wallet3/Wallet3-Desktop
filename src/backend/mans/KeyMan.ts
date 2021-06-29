import DBMan from './DBMan';
// import Store from '../Store';
import { WalletKey } from '../lib/WalletKey';

class KeyMan {
  currentWalletKey: WalletKey;

  async init() {
    const index = 1; //Store.get('keyIndex') || 1;

    const keys = await DBMan.accountRepo.find();
    console.log(keys.map((k) => k.id));
    const key = keys.find((k) => k.id === index) || keys[0];

    this.currentWalletKey = new WalletKey();
    this.currentWalletKey.init(key);
  }
}

export default new KeyMan();
