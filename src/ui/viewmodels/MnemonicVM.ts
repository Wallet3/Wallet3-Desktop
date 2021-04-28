import MessageKeys, { GenMnemonic } from '../../common/MessageKeys';
import { action, makeAutoObservable, runInAction } from 'mobx';

import { ipcRenderer } from 'electron';

export class MnemonicVM {
  phrases: string[] = [];
  address = '';

  constructor() {
    makeAutoObservable(this);
  }

  async requestMnemonic(length = 12) {
    const { address, mnemonic }: GenMnemonic = await ipcRenderer.invoke(MessageKeys.genMnemonic, length);

    runInAction(() => {
      this.address = address;
      this.phrases = mnemonic.split(/\s/);
    });
  }
}

export default new MnemonicVM();
