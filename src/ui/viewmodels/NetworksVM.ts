import { getProviderByChainId, markRpcFailed } from '../../common/Provider';

import Messages from '../../common/Messages';
import { Networks } from '../../common/Networks';
import ipc from '../bridges/IPC';
import { makeAutoObservable } from 'mobx';
import store from 'storejs';

const Keys = {
  currentNetworkId: () => `currentNetworkId`,
};

export class NetworksVM {
  currentChainId = 1;

  get currentNetwork() {
    return Networks.find((n) => n.chainId === this.currentChainId);
  }

  get currentProvider() {
    return getProviderByChainId(this.currentChainId);
  }

  constructor() {
    makeAutoObservable(this);
    this.setCurrentChainId(store.get(Keys.currentNetworkId()) || 1);
  }

  setCurrentChainId(value: number) {
    if (this.currentChainId === value) return;

    this.currentChainId = value;
    this.currentProvider.ready;
    store.set(Keys.currentNetworkId(), value);
    ipc?.invoke(Messages.changeChainId, value);
  }

  reportFailedRpc(network: number, rpc: string) {
    markRpcFailed(network, rpc);
  }
}

export default new NetworksVM();
