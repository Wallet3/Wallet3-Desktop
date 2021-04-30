import { makeAutoObservable } from 'mobx';
import store from 'storejs';

interface INetwork {
  network: string;
  chainId: number;
}

const Keys = {
  currentNetwork: 'currentNetwork',
  currentNetworkId: 'currentNetworkId',
};

export class NetworksVM {
  currentChainId: number = store.get(Keys.currentNetworkId) || 1;

  constructor() {
    makeAutoObservable(this);
  }

  setCurrentChainId(value: number) {
    if (this.currentChainId === value) return;

    this.currentChainId = value;
    store.set(Keys.currentNetworkId, value);
  }
}

export const Networks: INetwork[] = [
  {
    network: 'ETH',
    chainId: 1,
  },
  {
    network: 'MATIC',
    chainId: 137,
  },
  {
    network: 'BSC',
    chainId: 56,
  },
  {
    network: 'xDAI',
    chainId: 100,
  },
  {
    network: 'FTM',
    chainId: 250,
  },
];

export default new NetworksVM();
