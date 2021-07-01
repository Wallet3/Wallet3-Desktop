import {
  BscPopularTokens,
  EthereumPopularTokens,
  FTMPopularTokens,
  HecoPopularTokens,
  IToken,
  PolygonPopularTokens,
  xDaiPopularTokens,
} from '../misc/Tokens';
import { getProviderByChainId, markRpcFailed } from '../../common/Provider';

import Messages from '../../common/Messages';
import ipc from '../bridges/IPC';
import { makeAutoObservable } from 'mobx';
import store from 'storejs';

export interface INetwork {
  symbol: string;
  network: string;
  chainId: number;
  color: string;
  test?: boolean;
  order?: number;
  defaultTokens: IToken[];
}

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
    ipc.invoke(Messages.changeChainId, value);
  }

  reportFailedRpc(network: number, rpc: string) {
    markRpcFailed(network, rpc);
  }
}

export const PublicNetworks: INetwork[] = [
  {
    symbol: 'ETH',
    network: 'Ethereum',
    chainId: 1,
    color: '#6186ff',
    order: 1,
    defaultTokens: EthereumPopularTokens,
  },
  {
    symbol: 'MATIC',
    network: 'Polygon',
    chainId: 137,
    color: '#8247E5',
    order: 2,
    defaultTokens: PolygonPopularTokens,
  },
  {
    symbol: 'ETH',
    network: 'Optimism',
    chainId: 10,
    color: '#FF0420',
    order: 3,
    defaultTokens: [],
  },
  {
    symbol: 'xDAI',
    network: 'xDAI',
    chainId: 100,
    color: '#48A9A6',
    order: 3,
    defaultTokens: xDaiPopularTokens,
  },
  {
    symbol: 'FTM',
    chainId: 250,
    network: 'Fantom',
    color: '#1969FF',
    order: 4,
    defaultTokens: FTMPopularTokens,
  },
  {
    symbol: 'HT',
    chainId: 128,
    network: 'HECO',
    order: 6,
    color: '#01943f',
    defaultTokens: HecoPopularTokens,
  },
  {
    symbol: 'OKT',
    chainId: 66,
    network: 'OKEx',
    order: 7,
    color: '#24c',
    defaultTokens: [],
  },
  {
    symbol: 'BSC',
    network: 'BSC',
    chainId: 56,
    color: '#f3ba2f',
    order: 5,
    defaultTokens: BscPopularTokens,
  },
];

export const Testnets: INetwork[] = [
  {
    symbol: 'ETH',
    network: 'Ropsten',
    chainId: 3,
    color: '#6186ff',
    test: true,
    defaultTokens: [],
  },
  {
    symbol: 'ETH',
    network: 'Rinkeby',
    chainId: 4,
    color: '#6186ff',
    test: true,
    defaultTokens: [],
  },
  {
    symbol: 'ETH',
    network: 'Goerli',
    chainId: 5,
    color: '#6186ff',
    test: true,
    defaultTokens: [],
  },
  {
    symbol: 'ETH',
    network: 'Kovan',
    chainId: 42,
    color: '#6186ff',
    test: true,
    defaultTokens: [],
  },
  {
    symbol: 'MATIC',
    network: 'Mumbai',
    chainId: 80001,
    color: '#8247E5',
    test: true,
    defaultTokens: [],
  },
];

export const Networks: INetwork[] = [...PublicNetworks, ...Testnets];

export default new NetworksVM();
