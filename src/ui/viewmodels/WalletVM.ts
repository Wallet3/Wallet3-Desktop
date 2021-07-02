import Messages, { TxParams } from '../../common/Messages';
import { makeAutoObservable, reaction, runInAction, when } from 'mobx';

import { AccountVM } from './AccountVM';
import { DAppVM } from './wallet/DAppVM';
import { HistoryTxsVM } from './wallet/HistoryTxsVM';
import NetVM from './NetworksVM';
import { PendingTxVM } from './wallet/PendingTxVM';
import ipc from '../bridges/IPC';
import store from 'storejs';

const Keys = {
  lastUsedAccount: (walletId: number) => `w_${walletId}-lastUsedAccount`,
};

export class WalletVM {
  accounts: AccountVM[] = [];
  currentAccount: AccountVM = null;
  allPendingTxs: TxParams[] = [];
  connectedDApps: IWcSession[] = [];
  id = 1;

  get accountIndex() {
    return this.accounts.indexOf(this.currentAccount);
  }

  get pendingTxs() {
    return this.allPendingTxs.filter((tx) => tx.from === this.currentAccount.address).sort((t1, t2) => t1.nonce - t2.nonce);
  }

  get pendingTxCount() {
    return this.pendingTxs.length;
  }

  get appCount() {
    return this.connectedDApps.length;
  }

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => NetVM.currentChainId,
      () => this.currentAccount?.refresh()
    );

    ipc.on(Messages.pendingTxsChanged, (e, content: TxParams[]) => {
      runInAction(() => (this.allPendingTxs = content));
    });

    ipc.on(Messages.wcConnectsChanged, (e, content: IWcSession[]) =>
      runInAction(() => (this.connectedDApps = content.sort((a, b) => b.lastUsedTimestamp - a.lastUsedTimestamp)))
    );
  }

  initAccounts({
    addresses,
    pendingTxs,
    connectedDApps,
  }: {
    addresses: string[];
    pendingTxs?: TxParams[];
    connectedDApps?: IWcSession[];
  }) {
    this.connectedDApps = connectedDApps?.sort((a, b) => b.lastUsedTimestamp - a.lastUsedTimestamp) ?? this.connectedDApps;
    this.allPendingTxs = pendingTxs ?? this.allPendingTxs;
    this.accounts = addresses.map((address, i) => new AccountVM({ address, accountIndex: i + 1 }));

    const lastUsedAccount = store.get(Keys.lastUsedAccount(this.id)) || addresses[0];
    this.currentAccount = this.accounts.find((a) => a.address === lastUsedAccount) || this.accounts[0];
    this.currentAccount?.refresh();

    ipc.invokeSecure(Messages.changeAccountIndex, { index: this.accountIndex });
    setTimeout(() => this.refresh(), 45 * 1000);
  }

  selectAccount(account: AccountVM) {
    this.currentAccount = account;
    this.currentAccount.refresh();
    ipc.invokeSecure(Messages.changeAccountIndex, { index: this.accountIndex });
    store.set(Keys.lastUsedAccount(this.id), account.address);
  }

  async refresh() {
    await Promise.all([this.currentAccount?.refreshChainOverview(), this.currentAccount.refreshNativeToken(undefined)]);
    setTimeout(() => this.refresh(), (NetVM.currentChainId === 1 ? 45 : 10) * 1000);
  }

  pendingTxVM: PendingTxVM = null;

  selectPendingTx(tx: TxParams) {
    this.pendingTxVM = new PendingTxVM(tx);
  }

  dAppVM: DAppVM = null;

  selectDAppSession(session: IWcSession) {
    this.dAppVM = new DAppVM(session);
  }

  private _historyTxsVM: HistoryTxsVM = null;

  get historyTxsVM() {
    return (this._historyTxsVM = this._historyTxsVM ?? new HistoryTxsVM());
  }

  clean() {
    this.pendingTxVM = null;
    this._historyTxsVM?.selectTx(undefined);
  }
}

export default new WalletVM();
