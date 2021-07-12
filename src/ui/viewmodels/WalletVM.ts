import Messages, { IKey, TxParams } from '../../common/Messages';
import { makeAutoObservable, reaction, runInAction } from 'mobx';

import { AccountType } from '../../backend/models/Types';
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

  private key: IKey;

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

  get name() {
    return this.key.name;
  }

  get authenticated() {
    return this.accounts.length > 0;
  }

  get id() {
    return this.key.id;
  }

  get type(): AccountType {
    return this.key.type;
  }

  constructor(key: IKey) {
    makeAutoObservable(this);
    this.key = key;

    reaction(
      () => NetVM.currentChainId,
      () => this.currentAccount?.refresh()
    );

    ipc.on(Messages.wcConnectsChanged(key.id), (e, content: IWcSession[]) =>
      runInAction(() => (this.connectedDApps = content.sort((a, b) => b.lastUsedTimestamp - a.lastUsedTimestamp)))
    );
  }

  initAccounts({
    addresses,
    pendingTxs,
    connectedDApps,
  }: {
    addresses?: string[];
    pendingTxs?: TxParams[];
    connectedDApps?: IWcSession[];
  }) {
    if (addresses?.length > 0 && (!this.accounts || this.accounts.length === 0)) {
      this.accounts = addresses.map((address, i) => new AccountVM({ address, accountIndex: i + 1, walletId: this.id }));
      const lastUsedAccount = store.get(Keys.lastUsedAccount(this.id)) || addresses[0];
      this.selectAccount(this.accounts.find((a) => a.address === lastUsedAccount) || this.accounts[0]);

      setTimeout(() => this.refresh(), 45 * 1000);
    }

    this.connectedDApps = connectedDApps?.sort((a, b) => b.lastUsedTimestamp - a.lastUsedTimestamp) ?? this.connectedDApps;
    this.allPendingTxs = pendingTxs?.filter((t) => this.accounts.some((acc) => acc.address === t.from)) ?? this.allPendingTxs;

    return this;
  }

  changeName(name: string) {
    ipc.invokeSecure(Messages.changeKeyName, { keyId: this.id, name });
    this.key.name = name;
  }

  selectAccount(account: AccountVM) {
    if (this.currentAccount === account) return;

    this.currentAccount = account;
    this.currentAccount.refresh();
    ipc.invokeSecure(Messages.changeAccountIndex, { index: this.accountIndex, keyId: this.id });
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
    this.dAppVM = new DAppVM(session, this.key.id);
  }

  private _historyTxsVM: HistoryTxsVM = null;

  get historyTxsVM() {
    return (this._historyTxsVM = this._historyTxsVM ?? new HistoryTxsVM());
  }

  clean() {
    this.pendingTxVM = null;
    this._historyTxsVM?.selectTx(undefined);
    this.accounts.forEach((a) => a?.clean());
    store.remove(Keys.lastUsedAccount(this.id));
  }
}
