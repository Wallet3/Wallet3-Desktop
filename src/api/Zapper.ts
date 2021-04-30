import axios from 'axios';

const api_key = '96e0cc51-a62e-42ca-acee-910ea7d2a241';
const host = 'https://api.zapper.fi/v1';

export async function getTokenBalances(address: string) {
  try {
    const resp = await axios.get(`${host}/balances/tokens?addresses[]=${address}&api_key=${api_key}`);
    const data = resp.data as { [index: string]: TokenBalance[] };
    return data[address];
  } catch (error) {
    return [];
  }
}

export async function getGasPrice(network = 'ethereum') {}

interface TokenBalance {
  address: string;
  tokenAddress: string;
  decimals: number;
  img: string;
  label: string;
  symbol: string;
  balance: number;
  balanceRaw: string;
  balanceUSD: number;
  price: number;
  isStaked: boolean;
  hide: boolean;
  canExchange: boolean;
}
