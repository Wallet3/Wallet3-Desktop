import MessageKeys, { AuthenticationResult, BooleanResult, InitStatus, InitVerifyPassword } from '../../common/Messages';
import { action, makeObservable, observable } from 'mobx';

import Coingecko from '../../api/Coingecko';
import WalletVM from './WalletVM';
import { createMemoryHistory } from 'history';
import crypto from '../bridges/Crypto';
import ipc from '../bridges/IPC';
import store from 'storejs';

type AuthMethod = 'fingerprint' | 'keyboard';

export class Application {
  readonly history = createMemoryHistory();

  appAuthenticated = false;
  touchIDSupported = false;
  machineId = '';
  authMethod: AuthMethod = 'fingerprint';

  constructor() {
    makeObservable(this, { authMethod: observable, switchAuthMethod: action });

    ipc.on(MessageKeys.idleExpired, (e, { idleExpired }: { idleExpired: boolean }) => {
      if (idleExpired) this.history.push('/authentication');
    });

    this.authMethod = store.get('authMethod') || 'fingerprint';
  }

  async init(jump = true) {
    const { hasSecret, touchIDSupported, appAuthenticated, addresses, pendingTxs, connectedDApps, machineId } =
      await ipc.invokeSecure<InitStatus>(MessageKeys.getInitStatus);

    this.touchIDSupported = touchIDSupported;
    this.appAuthenticated = appAuthenticated;
    this.machineId = machineId;

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
    return crypto.sha256(`Ethereum.Wallet3-${passcode}-${this.machineId}`);
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

  scanQR() {
    return ipc.invoke(MessageKeys.scanQR);
  }

  connectWallet(uri: string) {
    return ipc.invokeSecure<BooleanResult>(MessageKeys.connectWallet, { uri, modal: true });
  }

  async ask(msg: { title: string; icon: string; message: string }) {
    const { approved } = await ipc.invokeSecure<{ approved: boolean }>(MessageKeys.popupMessageBox, msg);
    return approved;
  }
}

export default new Application();
