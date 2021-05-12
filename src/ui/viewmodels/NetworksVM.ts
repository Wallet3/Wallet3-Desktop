import { getProviderByChainId } from '../../common/Provider';
import { makeAutoObservable } from 'mobx';
import store from 'storejs';

interface INetwork {
  symbol: string;
  network: string;
  chainId: number;
  color: string;
}

const Keys = {
  currentNetwork: 'currentNetwork',
  currentNetworkId: 'currentNetworkId',
};

export class NetworksVM {
  currentChainId: number = store.get(Keys.currentNetworkId) || 1;
  get currentNetwork() {
    return Networks.find((n) => n.chainId === this.currentChainId);
  }

  get currentProvider() {
    return getProviderByChainId(this.currentChainId);
  }

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
  {
    symbol: 'ETH',
    network: 'Ropsten Testnet',
    chainId: 3,
    color: '#6186ff',
  },
  {
    symbol: 'ETH',
    network: 'Rinkeby Testnet',
    chainId: 4,
    color: '#6186ff',
  },
  {
    symbol: 'ETH',
    network: 'Goerli Testnet',
    chainId: 5,
    color: '#6186ff',
  },
  {
    symbol: 'ETH',
    network: 'Kovan Testnet',
    chainId: 42,
    color: '#6186ff',
  },
  // {
  //   symbol: 'FTM',
  //   chainId: 250,
  // },
];

export default new NetworksVM();
