import MessageKeys, { AuthenticationResult, BooleanResult, InitStatus, InitVerifyPassword } from '../../common/Messages';

import Coingecko from '../../api/Coingecko';
import WalletVM from './WalletVM';
import { createMemoryHistory } from 'history';
import crypto from '../bridges/Crypto';
import ipc from '../bridges/IPC';
import { makeObservable } from 'mobx';
import store from 'storejs';

export class Application {
  readonly history = createMemoryHistory();

  appAuthenticated = false;
  touchIDSupported = false;

  constructor() {
    makeObservable(this, {});

    ipc.on(MessageKeys.idleExpired, (e, { idleExpired }: { idleExpired: boolean }) => {
      if (idleExpired) this.history.push('/authentication');
    });
  }

  async init(jump = true) {
    const { hasSecret, touchIDSupported, appAuthenticated, addresses, pendingTxs, connectedDApps } =
      await ipc.invokeSecure<InitStatus>(MessageKeys.getInitStatus);

    this.touchIDSupported = touchIDSupported;
    this.appAuthenticated = appAuthenticated;

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

  async authInitialization(passcode: string) {
    const password = crypto.sha256(passcode);
    const { addresses, verified } = await ipc.invokeSecure<InitVerifyPassword>(MessageKeys.initVerifyPassword, {
      password,
      count: 10,
    });

    if (verified) {
      WalletVM.initAccounts({ addresses });
      this.appAuthenticated = true;
    }

    return verified;
  }

  async verifyPassword(passcode: string) {
    const password = crypto.sha256(passcode);
    return await ipc.invokeSecure<boolean>(MessageKeys.verifyPassword, { password });
  }

  async promptTouchID(message?: string) {
    return await ipc.invokeSecure<boolean>(MessageKeys.promptTouchID, { message });
  }

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
    return ipc.invokeSecure(MessageKeys.connectWallet, { uri, modal: true });
  }
}

export default new Application();
