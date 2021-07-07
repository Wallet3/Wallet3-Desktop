import MessageKeys, {
  AuthenticationResult,
  BooleanResult,
  IKey,
  InitStatus,
  InitVerifyPassword,
  KeysChanged,
  TxParams,
} from '../../common/Messages';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import Coingecko from '../../api/Coingecko';
import CurrencyVM from './settings/CurrencyVM';
import { WalletVM } from './WalletVM';
import clipboard from '../bridges/Clipboard';
import { createMemoryHistory } from 'history';
import crypto from '../bridges/Crypto';
import delay from 'delay';
import ipc from '../bridges/IPC';
import store from 'storejs';

type AuthMethod = 'fingerprint' | 'keyboard';

export class Application {
  readonly history = createMemoryHistory();

  touchIDSupported = false;
  connectingApp = false;

  wallets: WalletVM[] = [];
  currentWallet: WalletVM = null;

  get currentWalletId() {
    return this.currentWallet?.id;
  }

  authMethod: AuthMethod = 'fingerprint';
  platform: NodeJS.Platform = 'darwin';

  get isMac() {
    return this.platform === 'darwin';
  }

  get currencyVM() {
    return CurrencyVM;
  }

  constructor() {
    makeObservable(this, {
      authMethod: observable,
      isMac: computed,
      platform: observable,
      switchAuthMethod: action,
      connectingApp: observable,
      wallets: observable,
      currentWalletId: computed,
      currentWallet: observable,
      switchWallet: action,
    });

    ipc.on(MessageKeys.idleExpired, (e, { idleExpired }: { idleExpired: boolean }) => {
      if (!this.currentWallet?.authenticated) return;
      if (idleExpired) this.history.push('/authentication');
    });

    const updateWallets = (keys: IKey[]) => {
      const newKeys = keys.filter((k) => !this.wallets.find((w) => w.id === k.id));
      runInAction(() => this.wallets.push(...newKeys.map((k) => new WalletVM(k).initAccounts(k))));
    };

    ipc.on(MessageKeys.keysChanged, (e, keys: string) => {
      updateWallets(JSON.parse(keys) as IKey[]);
      console.log('keys changed', keys);
    });

    ipc.on(MessageKeys.currentKeyChanged, (e, obj) => {
      const { keys, keyId } = JSON.parse(obj) as KeysChanged;
      updateWallets(keys);
      runInAction(() => this.switchWallet(keyId));
      console.log('current key id changed', keyId);
    });

    this.authMethod = store.get('authMethod') || 'fingerprint';
  }

  async init(jump = true) {
    const { touchIDSupported, pendingTxs, platform, keys, currentKeyId } = await ipc.invokeSecure<InitStatus>(
      MessageKeys.getInitStatus
    );

    console.log(keys);

    this.wallets = keys.map((k) => new WalletVM(k).initAccounts(k));
    this.switchWallet(currentKeyId);
    this.touchIDSupported = touchIDSupported;

    ipc.on(MessageKeys.pendingTxsChanged, (e, pendingTxs: TxParams[]) => {
      runInAction(() => this.wallets.forEach((w) => w.initAccounts({ pendingTxs })));
    });

    runInAction(() => (this.platform = platform));

    const rootDiv = document.getElementById('root');
    rootDiv.classList.add(platform);

    Coingecko.start(30);

    this.wallets.find((w) => w.id === currentKeyId)?.initAccounts({ pendingTxs });

    if (!jump) return;

    if (keys.length === 0) {
      this.history.push('/welcome');
    } else {
      this.history.push('/authentication');
    }
  }

  async switchWallet(toId: number) {
    if (this.currentWalletId === toId && this.currentWallet) return;

    const { keyId } = await ipc.invokeSecure<{ keyId: number }>(MessageKeys.switchKey, { keyId: toId });

    const targetWallet = this.wallets.find((w) => w.id === keyId);
    if (!targetWallet) return;

    runInAction(() => (this.currentWallet = targetWallet));
    console.log(targetWallet, targetWallet.currentAccount, 'expected:', toId, 'switched', keyId);

    if (!targetWallet.authenticated) {
      this.history.push('/authentication');
    }
  }

  authInitialization = async (passcode: string) => {
    const password = this.hashPassword(passcode);
    const { addresses, verified, keyId } = await ipc.invokeSecure<InitVerifyPassword>(MessageKeys.initVerifyPassword, {
      password,
      count: 10,
    });

    if (!verified) return false;

    while (this.wallets.length === 0) {
      await delay(500);
    }

    while (!this.wallets.find((w) => w.id === keyId)) {
      await delay(500);
    }

    this.wallets.find((w) => w.id === keyId).initAccounts({ addresses });
    console.log('app auth init accounts', verified, this.currentWallet);

    return verified;
  };

  verifyPassword = async (passcode: string) => {
    const password = this.hashPassword(passcode);
    const { success } = await ipc.invokeSecure<BooleanResult>(MessageKeys.verifyPassword, { password });
    return success;
  };

  hashPassword = (passcode: string) => {
    return crypto.sha256(`Ethereum.Wallet3-${passcode}`);
  };

  promptTouchID = async (message?: string) => {
    const { success } = await ipc.invokeSecure<BooleanResult>(MessageKeys.promptTouchID, { message });
    return success;
  };

  switchAuthMethod = async (method: AuthMethod) => {
    this.authMethod = method;
    store.set('authMethod', method);
  };

  async auth() {
    const result = await ipc.invokeSecure<AuthenticationResult>(MessageKeys.popupAuthentication, {});
    return result;
  }

  async reset(authKey: string) {
    const { success } = await ipc.invokeSecure<BooleanResult>(MessageKeys.resetSystem, { authKey });
    if (success) store.clear();
    return success;
  }

  async scanQR() {
    if (await this.connectWallet()) return;

    runInAction(() => (this.connectingApp = true));
    await ipc.invoke(MessageKeys.scanQR);
    runInAction(() => (this.connectingApp = false));
  }

  async connectWallet() {
    if (this.connectingApp) return true;

    const uri = clipboard.readText();
    if (!uri.startsWith('wc:') || !uri.includes('bridge=')) return false;

    runInAction(() => (this.connectingApp = true));
    const { success } = await ipc.invokeSecure<BooleanResult>(MessageKeys.connectWallet, { uri, modal: true });
    runInAction(() => (this.connectingApp = false));
    return success;
  }

  async ask(msg: { title: string; icon: string; message: string }) {
    const { approved } = await ipc.invokeSecure<{ approved: boolean }>(MessageKeys.popupMessageBox, msg);
    return approved;
  }
}

export default new Application();
