import MessageKeys, { GenMnemonic } from '../../common/IPC';
import { action, makeAutoObservable, runInAction } from 'mobx';

import crypto from '../ipc/Crypto';
import ipc from '../ipc/Bridge';

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

  async saveMnemonic(passcode: string) {
    const password = crypto.sha256(passcode);
    await ipc.invokeSecure<boolean>(MessageKeys.saveMnemonic, { password });
  }
}

export default new MnemonicVM();
