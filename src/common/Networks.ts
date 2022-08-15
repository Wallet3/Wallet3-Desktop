import {
  ArbiPopularTokens,
  BobaPopularTokens,
  BscPopularTokens,
  CeloPopularTokens,
  EthereumPopularTokens,
  FTMPopularTokens,
  HecoPopularTokens,
  IToken,
  PolygonPopularTokens,
  xDaiPopularTokens,
  zkSyncTestPopularTokens,
} from '../misc/Tokens';

export interface INetwork {
  comm_id?: string;
  symbol: string;
  network: string;
  chainId: number;
  color: string;
  test?: boolean;
  l2?: boolean;
  eip1559?: boolean;
  order?: number;
  defaultTokens: IToken[];
  showOverview?: boolean;
  minGwei?: number;
}

export const PublicNetworks: INetwork[] = [
  {
    symbol: 'ETH',
    comm_id: 'eth',
    network: 'Ethereum',
    chainId: 1,
    color: '#6186ff',
    eip1559: true,
    order: 1,
    defaultTokens: EthereumPopularTokens,
    showOverview: true,
  },
  {
    symbol: 'ETH',
    comm_id: 'op',
    network: 'Optimism',
    chainId: 10,
    color: '#FF0420',
    order: 3,
    l2: true,
    defaultTokens: [],
    showOverview: false,
  },
  {
    symbol: 'ETH',
    comm_id: 'arb',
    network: 'Arbitrum',
    chainId: 42161,
    color: '#2D374B',
    order: 3,
    l2: true,
    defaultTokens: ArbiPopularTokens,
    showOverview: false,
  },
  // {
  //   symbol: 'ETH',
  //   comm_id: 'boba',
  //   network: 'Boba',
  //   chainId: 288,
  //   color: '#1CD8D2',
  //   l2: true,
  //   defaultTokens: BobaPopularTokens,
  // },
  {
    symbol: 'MATIC',
    comm_id: 'matic',
    network: 'Polygon',
    chainId: 137,
    color: '#8247E5',
    order: 2,
    defaultTokens: PolygonPopularTokens,
    showOverview: true,
    minGwei: 30,
  },
  {
    symbol: 'xDAI',
    comm_id: 'xdai',
    network: 'xDAI',
    chainId: 100,
    color: '#48A9A6',
    order: 3,
    defaultTokens: xDaiPopularTokens,
    showOverview: true,
    eip1559: true,
  },
  {
    symbol: 'FTM',
    comm_id: 'ftm',
    chainId: 250,
    network: 'Fantom',
    color: '#1969FF',
    order: 4,
    defaultTokens: FTMPopularTokens,
    showOverview: true,
    minGwei: 50,
  },
  {
    symbol: 'AVAX',
    comm_id: 'avax',
    chainId: 43114,
    network: 'Avalanche',
    color: '#E84142',
    order: 5,
    eip1559: true,
    defaultTokens: [],
    showOverview: true,
  },
  {
    symbol: 'CELO',
    comm_id: 'celo',
    chainId: 42220,
    network: 'Celo',
    color: '#5EA33B',
    order: 6,
    defaultTokens: CeloPopularTokens,
  },
  {
    symbol: 'BCH',
    comm_id: 'bch',
    chainId: 10000,
    network: 'SmartBCH',
    order: 7,
    color: '#8dc351',
    defaultTokens: [],
  },
  {
    symbol: 'HT',
    comm_id: 'heco',
    chainId: 128,
    network: 'HECO',
    order: 6,
    color: '#01943f',
    defaultTokens: HecoPopularTokens,
  },
  {
    symbol: 'OKT',
    comm_id: 'okt',
    chainId: 66,
    network: 'OKEx',
    order: 7,
    color: '#24c',
    defaultTokens: [],
  },
  {
    symbol: 'BNB',
    comm_id: 'bsc',
    network: 'BSC',
    chainId: 56,
    color: '#f3ba2f',
    order: 5,
    defaultTokens: BscPopularTokens,
    showOverview: true,
    minGwei: 5,
  },
];

export const Testnets: INetwork[] = [
  {
    symbol: 'ETH',
    network: 'Ropsten',
    chainId: 3,
    color: '#6186ff',
    test: true,
    eip1559: true,
    defaultTokens: [],
  },
  {
    symbol: 'ETH',
    network: 'Rinkeby',
    chainId: 4,
    color: '#6186ff',
    test: true,
    eip1559: true,
    defaultTokens: [],
  },
  {
    symbol: 'ETH',
    network: 'Goerli',
    chainId: 5,
    color: '#6186ff',
    eip1559: true,
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
    symbol: 'BNB',
    chainId: 97,
    network: 'BSC Testnet',
    color: '#f3ba2f',
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
  {
    symbol: 'ETH',
    network: 'zkSync 2.0 Rinkeby',
    chainId: 272,
    color: '',
    test: true,
    defaultTokens: zkSyncTestPopularTokens,
  },
];

export const Networks: INetwork[] = [...PublicNetworks, ...Testnets];
