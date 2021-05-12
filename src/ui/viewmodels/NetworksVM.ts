import Messages from '../../common/Messages';
import { getProviderByChainId } from '../../common/Provider';
import ipc from '../bridges/IPC';
import { makeAutoObservable } from 'mobx';
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

  constructor() {
    makeAutoObservable(this);
    this.setCurrentChainId(store.get(Keys.currentNetworkId) || 1);
  }

  setCurrentChainId(value: number) {
    if (this.currentChainId === value) return;

    this.currentChainId = value;
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
