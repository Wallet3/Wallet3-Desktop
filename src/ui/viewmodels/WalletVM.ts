import Messages, { TxParams } from '../../common/Messages';
import NetVM, { Networks } from './NetworksVM';
import { makeAutoObservable, reaction, runInAction, when } from 'mobx';

import { AccountVM } from './AccountVM';
import { PendingTxVM } from './PendingTxVM';
import ipc from '../bridges/IPC';
import store from 'storejs';

const Keys = {
  lastUsedAccount: 'lastUsedAccount',
};

export class WalletVM {
  accounts: AccountVM[] = [];
  currentAccount: AccountVM = null;
  allPendingTxs: TxParams[] = [];

  get accountIndex() {
    return this.accounts.indexOf(this.currentAccount);
  }

  get pendingTxs() {
    return this.allPendingTxs.filter((tx) => tx.from === this.currentAccount.address);
  }

  get pendingTxCount() {
    return this.pendingTxs.length;
  }

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => NetVM.currentChainId,
      () => this.currentAccount?.refresh()
    );

    ipc.on(Messages.pendingTxsChanged, (e, content: string) => {
      runInAction(() => {
        try {
          this.allPendingTxs = JSON.parse(content);
        } catch (error) {}
      });
    });

    ipc.on(Messages.wcConnectsChanged, (e, content: IWcSession[]) => {});
  }

  initAccounts(addresses: string[]) {
    this.accounts = addresses.map((address, i) => new AccountVM({ address, accountIndex: i + 1 }));

    const lastUsedAccount = store.get(Keys.lastUsedAccount) || addresses[0];
    this.currentAccount = this.accounts.find((a) => a.address === lastUsedAccount) || this.accounts[0];
    this.currentAccount.refresh();

    ipc.invokeSecure(Messages.changeAccountIndex, { index: addresses.indexOf(lastUsedAccount) });
    setTimeout(() => this.refresh(), 45 * 1000);
  }

  selectAccount(account: AccountVM) {
    this.currentAccount = account;
    this.currentAccount.refresh();
    ipc.invokeSecure(Messages.changeAccountIndex, { index: this.accountIndex });
    store.set(Keys.lastUsedAccount, account.address);
  }

  refresh() {
    this.currentAccount?.refreshChainTokens();
    setTimeout(() => this.refresh(), 45 * 1000);
  }

  pendingTxVM: PendingTxVM = null;

  selectPendingTx(tx: TxParams) {
    this.pendingTxVM = new PendingTxVM(tx);
  }
}

export default new WalletVM();
