import * as Providers from './.wallet3.rc.json';
import * as ethers from 'ethers';

import axios from 'axios';

// For bsc
// https://bscproject.org/#/rpcserver

const cache = new Map<number, ethers.providers.BaseProvider>();

export function getProviderByChainId(chainId: number) {
  if (cache.has(chainId)) {
    return cache.get(chainId);
  }

  const list = Providers[`${chainId}`] as string[];
  if (!list) {
    throw new Error(`Unsupported chain:${chainId}`);
  }

  const provider = new ethers.providers.JsonRpcProvider(list[0], chainId);
  cache.set(chainId, provider);
  return provider;
}

export async function sendTransaction(chainId: number, txHex: string) {
  const [url] = Providers[`${chainId}`] as string[];

  try {
    const resp = await axios.post(url, {
      jsonrpc: '2.0',
      method: 'eth_sendRawTransaction',
      params: [txHex],
      id: Date.now(),
    });

    return resp.data as { id: number; result: string };
  } catch (error) {
    return undefined;
  }
}

export async function getTransactionCount(chainId: number, address: string) {
  const [url] = Providers[`${chainId}`] as string[];

  try {
    const resp = await axios.post(url, {
      jsonrpc: '2.0',
      method: 'eth_getTransactionCount',
      params: [address, 'latest'],
      id: Date.now(),
    });

    const { result } = resp.data as { id: number; result: string };
    return Number.parseInt(result);
  } catch (error) {
    return 0;
  }
}

export async function call<T>(
  chainId: number,
  args: {
    from?: string;
    to: string;
    gas?: string | number;
    gasPrice?: string | number;
    value?: string | number;
    data: string;
  }
) {
  const [url] = Providers[`${chainId}`] as string[];

  try {
    const resp = await axios.post(url, {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [args, 'latest'],
      id: Date.now(),
    });

    return resp.data.result as T;
  } catch (error) {
    return undefined;
  }
}

export async function getTransactionReceipt(chainId: number, hash: string) {
  const [url] = Providers[`${chainId}`] as string[];

  try {
    const resp = await axios.post(url, {
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      params: [hash],
      id: Date.now(),
    });

    if (!resp.data.result) {
      console.log(resp.data);
      return null;
    }

    return resp.data.result as {
      transactionHash: string;
      transactionIndex: string;
      blockNumber: string;
      blockHash: string;
      contractAddress: string;
      status: string;
      gasUsed: string;
    };
  } catch (error) {
    return undefined;
  }
}
