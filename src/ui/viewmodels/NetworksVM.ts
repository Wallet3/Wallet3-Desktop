import Messages, { TxParams } from '../../common/Messages';
import { makeAutoObservable, runInAction } from 'mobx';

import { getProviderByChainId } from '../../common/Provider';
import ipc from '../bridges/IPC';
import store from 'storejs';

interface INetwork {
  symbol: string;
  network: string;
  chainId: number;
  color: string;
  test?: boolean;
}

const Keys = {
  currentNetwork: 'currentNetwork',
  currentNetworkId: 'currentNetworkId',
};

export class NetworksVM {
  currentChainId = 1;
  
  get currentNetwork() {
    return Networks.find((n) => n?.chainId === this.currentChainId);
  }

  get currentProvider() {
    return getProviderByChainId(this.currentChainId);
  }

  pendingTxs: TxParams[] = [];

  get pendingTxCount() {
    return this.pendingTxs.length;
  }

  constructor() {
    makeAutoObservable(this);
    this.setCurrentChainId(store.get(Keys.currentNetworkId) || 1);

    ipc.on(Messages.pendingTxsChanged, (e, content: string) => {
      console.log('pending', content);
      try {
        runInAction(() => {
          // this.pendingTxs.splice(0);
          // this.pendingTxs.push(...(JSON.parse(content) as TxParams[]));
          this.pendingTxs = JSON.parse(content);
        });
      } catch (error) {}
    });
  }

  setCurrentChainId(value: number) {
    if (this.currentChainId === value) return;

    this.currentChainId = value;
    this.currentProvider.ready;
    store.set(Keys.currentNetworkId, value);
    ipc.invoke(Messages.changeChainId, value);
  }
}

export const Networks: INetwork[] = [
  {
    symbol: 'ETH',
    network: 'Ethereum',
    chainId: 1,
    color: '#6186ff',
  },
  {
    symbol: 'MATIC',
    network: 'Polygon',
    chainId: 137,
    color: '#8247E5',
  },
  {
    symbol: 'BSC',
    network: 'BSC',
    chainId: 56,
    color: '#f3ba2f',
  },
  {
    symbol: 'xDAI',
    network: 'xDAI',
    chainId: 100,
    color: '#48A9A6',
  },
  null,
  {
    symbol: 'ETH',
    network: 'Ropsten Testnet',
    chainId: 3,
    color: '#6186ff',
    test: true,
  },
  {
    symbol: 'ETH',
    network: 'Rinkeby Testnet',
    chainId: 4,
    color: '#6186ff',
    test: true,
  },
  {
    symbol: 'ETH',
    network: 'Goerli Testnet',
    chainId: 5,
    color: '#6186ff',
    test: true,
  },
  {
    symbol: 'ETH',
    network: 'Kovan Testnet',
    chainId: 42,
    color: '#6186ff',
    test: true,
  },
  // {
  //   symbol: 'FTM',
  //   chainId: 250,
  // },
];

export default new NetworksVM();
