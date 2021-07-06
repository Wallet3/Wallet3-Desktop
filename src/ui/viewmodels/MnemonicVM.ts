import MessageKeys, { BooleanResult, GenMnemonic, SetupMnemonic } from '../../common/Messages';
import { action, makeAutoObservable, runInAction } from 'mobx';

import App from './Application';
import delay from 'delay';
import ipc from '../bridges/IPC';
import { utils } from 'ethers';

export class MnemonicVM {
  phrases: string[] = new Array(12).fill('');
  privkey: string = '';
  address = '';
  saving = false;

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

  checkSecret(secret: string) {
    if (utils.isValidMnemonic(secret)) return true;

    if ((secret.toLowerCase().startsWith('0x') && secret.length === 66) || secret.length === 64) return true;

    return undefined;
  }

  async saveTmpSecret(secret: string) {
    const { success } = await ipc.invokeSecure(MessageKeys.saveTmpSecret, { secret });
    return success;
  }

  async setupMnemonic(passcode: string) {
    if (this.saving) return;
    this.saving = true;

    const password = App.hashPassword(passcode);
    const { success, addresses } = await ipc.invokeSecure<SetupMnemonic>(MessageKeys.setupMnemonic, { password });

    while (!App.currentWallet) {
      console.log('waiting current wallet', App.currentWallet, App.wallets.length);
      await delay(500);
    }

    console.log('setup mn', success)
    if (success && App.currentWallet.accounts.length === 0) {
      console.log('init accounts', success);
      App.currentWallet.initAccounts({ addresses });
    }

    this.saving = false;
    return success;
  }

  async readSecret(authKey: string) {
    const { secret } = await ipc.invokeSecure<{ secret: string }>(`${MessageKeys.readSecret}`, { authKey });
    if (!secret) return;

    runInAction(() => {
      if (utils.isValidMnemonic(secret)) this.phrases = secret.split(/\s/);
      else this.privkey = secret;
    });
  }

  async changePasscode(authKey: string, passcode: string) {
    const { success } = await ipc.invokeSecure<BooleanResult>(`${MessageKeys.changePassword}`, {
      authKey,
      newPassword: App.hashPassword(passcode),
    });

    return success;
  }

  clean() {
    this.phrases = new Array(12).fill('');
  }

  private _delayTimer: NodeJS.Timer;
  setPath(fullPath: string) {
    if (!fullPath.startsWith('m/')) return;

    clearTimeout(this._delayTimer);
    this._delayTimer = setTimeout(() => {
      ipc.invokeSecure(MessageKeys.setDerivationPath, { fullPath });
    }, 500);
  }
}

export default new MnemonicVM();
