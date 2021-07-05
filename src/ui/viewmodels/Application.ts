import MessageKeys, {
  AuthenticationResult,
  BooleanResult,
  IKey,
  InitStatus,
  InitVerifyPassword,
} from '../../common/Messages';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import Coingecko from '../../api/Coingecko';
import WalletVM from './WalletVM';
import clipboard from '../bridges/Clipboard';
import { createMemoryHistory } from 'history';
import crypto from '../bridges/Crypto';
import ipc from '../bridges/IPC';
import store from 'storejs';

type AuthMethod = 'fingerprint' | 'keyboard';

export class Application {
  readonly history = createMemoryHistory();

  appAuthenticated = false;
  touchIDSupported = false;
  connectingApp = false;
  keys: IKey[] = [];

  authMethod: AuthMethod = 'fingerprint';
  platform: NodeJS.Platform = 'darwin';
  get isMac() {
    return this.platform === 'darwin';
  }

  constructor() {
    makeObservable(this, {
      authMethod: observable,
      isMac: computed,
      platform: observable,
      switchAuthMethod: action,
      connectingApp: observable,
      keys: observable,
    });

    ipc.on(MessageKeys.idleExpired, (e, { idleExpired }: { idleExpired: boolean }) => {
      if (!this.appAuthenticated) return;
      if (idleExpired) this.history.push('/authentication');
    });

    this.authMethod = store.get('authMethod') || 'fingerprint';
  }

  async init(jump = true) {
    const { hasSecret, touchIDSupported, appAuthenticated, addresses, pendingTxs, connectedDApps, platform, keys } =
      await ipc.invokeSecure<InitStatus>(MessageKeys.getInitStatus);

    console.log(keys);
    this.keys = keys;
    this.touchIDSupported = touchIDSupported;
    this.appAuthenticated = appAuthenticated;
    runInAction(() => (this.platform = platform));

    const appDiv = document.getElementById('root');
    appDiv.classList.add(platform);

    Coingecko.start(30);

    if (addresses?.length > 0) {
      WalletVM.initAccounts({ addresses, pendingTxs, connectedDApps });
    }

    if (!jump) return;

    if (!hasSecret) {
      this.history.push('/welcome');
    } else {
      this.history.push('/authentication');
    }
  }

  authInitialization = async (passcode: string) => {
    const password = this.hashPassword(passcode);
    const { addresses, verified } = await ipc.invokeSecure<InitVerifyPassword>(MessageKeys.initVerifyPassword, {
      password,
      count: 10,
    });

    if (verified) {
      WalletVM.initAccounts({ addresses });
      this.appAuthenticated = true;
    }

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

  clearHistory() {
    return ipc.invoke(MessageKeys.clearHistory);
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
