import axios, { AxiosRequestConfig } from 'axios';

import { DebankApiKey } from '../common/Secrets';
import store from 'storejs';

const host = 'https://pro-openapi.debank.com';
type chain = 'eth' | 'bsc' | 'xdai' | 'matic' | string;
type ChainBalance = { usd_value: number };

const DAY = 24 * 60 * 60 * 1000;

const CacheKeys = {
  overview: 'Debank_overview',
  user_tokens: (chainId: number, address: string) => `Debank_tokens_${chainId}_${address.toLowerCase()}`,
  chain_balance: (chainId: number, address: string) => `Debank_chainBalance_${chainId}_${address.toLowerCase()}`,
};

const MemoryCache: { [key: string]: any } = {};

export const DebankSupportedChains = new Map<number, string>();

const axiosConfig: AxiosRequestConfig = {
  timeout: 5000,
  headers: {
    AccessKey: DebankApiKey,
  },
};

export async function getChainBalance(address: string, chain: chain, chainId: number) {
  if (MemoryCache[CacheKeys.chain_balance(chainId, address)]) {
    return MemoryCache[CacheKeys.chain_balance(chainId, address)] as ChainBalance;
  }

  let debankChainBalance: ChainBalance | undefined;

  do {
    try {
      const cacheJson = store.get(CacheKeys.chain_balance(chainId, address)) as { timestamp: number; data: ChainBalance };

      if (cacheJson) {
        const { timestamp, data } = cacheJson;
        if (!Number.isNaN(data?.usd_value)) debankChainBalance = data;

        if (timestamp + 1 * DAY > Date.now()) break;
      }
    } catch (error) {}

    try {
      const resp = await axios.get(
        `${host}/v1/user/chain_balance?id=${address}&chain_id=${DebankSupportedChains.get(chainId) || chain}`.toLowerCase(),
        axiosConfig
      );

      const data = resp.data as ChainBalance;
      if (Number.isNaN(data?.usd_value)) break;

      debankChainBalance = data;
      store.set(CacheKeys.chain_balance(chainId, address), { timestamp: Date.now(), data });
    } catch (error) {}
  } while (false);

  MemoryCache[CacheKeys.chain_balance(chainId, address)] = debankChainBalance;
  return debankChainBalance;
}

export async function getTokenBalances(address: string, chain: chain, is_all = false, chainId: number) {
  if (MemoryCache[CacheKeys.user_tokens(chainId, address)]) {
    return MemoryCache[CacheKeys.user_tokens(chainId, address)] as ITokenBalance[];
  }

  let debankTokens: ITokenBalance[] | undefined;

  do {
    try {
      const cacheJson = (await store.get(CacheKeys.user_tokens(chainId, address))) as {
        timestamp: number;
        data: ITokenBalance[];
      };

      if (cacheJson) {
        const { timestamp, data } = cacheJson;
        if (Array.isArray(data)) debankTokens = data;
        if (timestamp + 3 * DAY > Date.now()) break;
      }
    } catch (error) {}

    try {
      const resp = await axios.get(
        `${host}/v1/user/token_list?id=${address}&chain_id=${
          DebankSupportedChains.get(chainId) || chain
        }&is_all=${is_all}`.toLowerCase(),
        axiosConfig
      );
      const data = resp.data as ITokenBalance[];
      if (!Array.isArray(data)) break;

      debankTokens = data;
      store.set(CacheKeys.user_tokens(chainId, address), { timestamp: Date.now(), data });
    } catch (error) {}
  } while (false);

  const result = debankTokens ? debankTokens : [];
  MemoryCache[CacheKeys.user_tokens(chainId, address)] = result.length > 0 ? result : undefined;

  return result;
}

export async function fetchChainsOverview(address: string) {
  let debankOverview: ITotalBalance | undefined;

  do {
    const cacheJson = (await store.get(CacheKeys.overview)) as {
      timestamp: number;
      data: ITotalBalance;
    };

    if (cacheJson) {
      try {
        const { timestamp, data } = cacheJson;

        debankOverview = data;
        if (timestamp + 15 * DAY > Date.now()) break;
      } catch (error) {}
    }

    try {
      const resp = await axios.get(`${host}/v1/user/total_balance?id=${address}`.toLowerCase(), axiosConfig);
      const data = resp.data as ITotalBalance;

      if (!Array.isArray(data.chain_list)) break;

      debankOverview = data;
      store.set(CacheKeys.overview, { timestamp: Date.now(), data });
    } catch (error) {}
  } while (false);

  if (!debankOverview) return;

  for (let chain of debankOverview.chain_list) {
    DebankSupportedChains.set(Number(chain.community_id), chain.id);
  }

  return debankOverview;
}

export interface ITokenBalance {
  id: string;
  chain: string;
  name: string;
  symbol: string;
  display_symbol?: string;
  optimized_symbol?: string;
  decimals: number;
  logo_url?: string;
  price?: number;
  is_verified?: boolean;
  is_core?: boolean;
  is_wallet?: boolean;
  time_at?: number;
  amount: number;
  wei?: string;
}

interface ITotalBalance {
  total_usd_value: number;
  chain_list: IChainBalance[];
}

export interface IChainBalance {
  id: string;
  community_id: number;
  name: string;
  native_token_id: string;
  logo_url: string;
  wrapped_token_id: string;
  usd_value: number;
}
