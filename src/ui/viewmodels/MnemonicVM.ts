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

  async saveTmpMnemonic(mnemonic: string) {
    await ipc.invokeSecure(MessageKeys.saveTmpMnemonic, { mnemonic });
  }

  async setupMnemonic(passcode: string) {
    const password = crypto.sha256(passcode);
    return await ipc.invokeSecure<boolean>(MessageKeys.setupMnemonic, { password });
  }
}

export default new MnemonicVM();
