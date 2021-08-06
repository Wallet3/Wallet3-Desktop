import * as Providers from './.wallet3.rc.json';
import * as ethers from 'ethers';

import axios from 'axios';

const cache = new Map<number, ethers.providers.JsonRpcProvider | ethers.providers.WebSocketProvider>();
const failedRPCs = new Set<string>();

export function getProviderByChainId(chainId: number) {
  if (cache.has(chainId)) {
    return cache.get(chainId);
  }

  const list = Providers[`${chainId}`] as string[];
  if (!list) {
    throw new Error(`Unsupported chain:${chainId}`);
  }

  const url = list.filter((rpc) => !failedRPCs.has(rpc))[0] || list[0];

  const provider = url.startsWith('http')
    ? new ethers.providers.JsonRpcProvider(url, chainId)
    : new ethers.providers.WebSocketProvider(url, chainId);

  cache.set(chainId, provider);
  return provider;
}

export function markRpcFailed(network: number, rpc: string) {
  cache.delete(network);
  failedRPCs.add(rpc);
}

export async function sendTransaction(chainId: number, txHex: string) {
  const rpcs = Providers[`${chainId}`] as string[];

  for (let url of rpcs) {
    try {
      const resp = await axios.post(url, {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [txHex],
        id: Date.now(),
      });

      return resp.data as { id: number; result: string };
    } catch (error) {}
  }

  return undefined;
}

export async function getTransactionCount(chainId: number, address: string) {
  const rpcs = Providers[`${chainId}`] as string[];

  for (let url of rpcs) {
    try {
      const resp = await axios.post(url, {
        jsonrpc: '2.0',
        method: 'eth_getTransactionCount',
        params: [address, 'pending'],
        id: Date.now(),
      });

      const { result } = resp.data as { id: number; result: string };
      return Number.parseInt(result);
    } catch (error) {}
  }

  return 0;
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
  const rpcs = Providers[`${chainId}`] as string[];

  for (let url of rpcs) {
    try {
      const resp = await axios.post(url, {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [args, 'latest'],
        id: Date.now(),
      });

      return resp.data.result as T;
    } catch (error) {}
  }

  return undefined;
}

export async function estimateGas<T>(
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
  const rpcs = Providers[`${chainId}`] as string[];

  for (let url of rpcs) {
    try {
      const resp = await axios.post(url, {
        jsonrpc: '2.0',
        method: 'eth_estimateGas',
        params: [args, 'latest'],
        id: Date.now(),
      });

      return resp.data.result as T;
    } catch (error) {}
  }

  return undefined;
}

export async function getTransactionReceipt(chainId: number, hash: string) {
  const rpcs = Providers[`${chainId}`] as string[];

  for (let url of rpcs) {
    try {
      const resp = await axios.post(url, {
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [hash],
        id: Date.now(),
      });

      if (!resp.data.result) {
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
    } catch (error) {}
  }

  return undefined;
}

export async function getNextBlockBaseFee(chainId: number) {
  const rpcs = Providers[`${chainId}`] as string[];

  for (let url of rpcs) {
    try {
      const resp = await axios.post(url, {
        jsonrpc: '2.0',
        method: 'eth_feeHistory',
        params: [1, 'latest', []],
        id: Date.now(),
      });

      const { baseFeePerGas } = resp.data.result as { baseFeePerGas: string[]; oldestBlock: number };

      if (baseFeePerGas.length === 0) return 0;

      return Number.parseInt(baseFeePerGas[baseFeePerGas.length - 1]);
    } catch (error) {}
  }

  return 0;
}

export async function getMaxPriorityFee(chainId: number) {
  const rpcs = Providers[`${chainId}`] as string[];

  for (let url of rpcs) {
    try {
      const resp = await axios.post(url, {
        jsonrpc: '2.0',
        method: 'eth_maxPriorityFeePerGas',
        params: [],
        id: Date.now(),
      });

      return Number.parseInt(resp.data.result);
    } catch (error) {}
  }

  return 0;
}