import axios, { AxiosRequestConfig } from 'axios';

const host = 'https://openapi.debank.com';
type chain = 'eth' | 'bsc' | 'xdai' | 'matic' | string;

const axiosConfig: AxiosRequestConfig = {
  timeout: 5000,
};

export async function getChainBalance(address: string, chain: chain) {
  try {
    const resp = await axios.get(`${host}/v1/user/chain_balance?id=${address}&chain_id=${chain}`.toLowerCase(), axiosConfig);

    const data = resp.data as { usd_value: number };
    return data;
  } catch (error) {
    return 0;
  }
}

export async function getTokenBalances(address: string, chain: chain, is_all = false) {
  try {
    const resp = await axios.get(
      `${host}/v1/user/token_list?id=${address}&chain_id=${chain}&is_all=${is_all}`.toLowerCase(),
      axiosConfig
    );
    const data = resp.data as ITokenBalance[];
    return data;
  } catch (error) {
    return [];
  }
}

export async function fetchChainsOverview(address: string) {
  try {
    const resp = await axios.get(`${host}/v1/user/total_balance?id=${address}`.toLowerCase(), axiosConfig);
    const data = resp.data as ITotalBalance;
    return data;
  } catch (error) {
    return undefined;
  }
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
