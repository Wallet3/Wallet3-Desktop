import MessageKeys, { BooleanResult, GenMnemonic, SetupMnemonic } from '../../common/Messages';
import { action, makeAutoObservable, runInAction } from 'mobx';

import App from './Application';
import WalletVM from './WalletVM';
import ipc from '../bridges/IPC';
import { utils } from 'ethers';

export class MnemonicVM {
  phrases: string[] = new Array(12).fill('');
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

  checkSecret(secret: string) {
    if (utils.isValidMnemonic(secret)) return true;

    if ((secret.toLowerCase().startsWith('0x') && secret.length === 66) || secret.length === 64) return true;

    // try {
    //   if (JSON.parse(secret)) true;
    // } catch (error) {}

    return undefined;
  }

  async saveTmpSecret(secret: string) {
    const { success } = await ipc.invokeSecure(MessageKeys.saveTmpSecret, { secret });
    return success;
  }

  async setupMnemonic(passcode: string) {
    const password = App.hashPassword(passcode);
    const { success, addresses } = await ipc.invokeSecure<SetupMnemonic>(MessageKeys.setupMnemonic, { password });

    if (success) {
      App.appAuthenticated = true;
      WalletVM.initAccounts({ addresses });
    }

    return success;
  }

  async readMnemonic(authKey: string) {
    const { mnemonic } = await ipc.invokeSecure<{ mnemonic: string }>(`${MessageKeys.readMnemonic}`, { authKey });
    if (!mnemonic) return;

    runInAction(() => {
      this.phrases = mnemonic.split(/\s/);
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
