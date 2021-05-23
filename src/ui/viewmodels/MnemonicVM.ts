import MessageKeys, { GenMnemonic, SetupMnemonic } from '../../common/Messages';
import { action, makeAutoObservable, runInAction } from 'mobx';

import WalletVM from './WalletVM';
import crypto from '../bridges/Crypto';
import ipc from '../bridges/IPC';

export class MnemonicVM {
  phrases: string[] = [];
  address = '';

  constructor() {
    makeAutoObservable(this);
  }

  async requestMnemonic(length = 12) {
    const { address, mnemonic } = await ipc.invokeSecure<GenMnemonic>(MessageKeys.genMnemonic, { length });

    runInAction(() => {
      this.address = address;
      this.phrases = mnemonic.split(/\s/);
    });
  }

  async saveTmpMnemonic(mnemonic: string) {
    await ipc.invokeSecure(MessageKeys.saveTmpMnemonic, { mnemonic });
  }

  async setupMnemonic(passcode: string) {
    const password = crypto.sha256(passcode);
    const { success, addresses } = await ipc.invokeSecure<SetupMnemonic>(MessageKeys.setupMnemonic, { password });
    if (success) WalletVM.initAccounts(addresses);

    return success;
  }

  async readMnemonic(authKey: string) {
    const { mnemonic } = await ipc.invokeSecure<{ mnemonic: string }>(`${MessageKeys.readMnemonic}`, { authKey });

    runInAction(() => {
      this.phrases = mnemonic.split(/\s/);
    });
  }

  clean() {
    this.phrases = [];
  }

  private _delayTimer: NodeJS.Timer;
  setPath(fullPath: string) {
    clearTimeout(this._delayTimer);
    this._delayTimer = setTimeout(() => {
      ipc.invokeSecure(MessageKeys.setDerivationPath, { fullPath });
    }, 500);
  }
}

export default new MnemonicVM();
