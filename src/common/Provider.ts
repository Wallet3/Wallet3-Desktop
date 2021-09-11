import * as Providers from './.wallet3.rc.json';
import * as ethers from 'ethers';

import { Gwei_1 } from '../gas/Gasnow';
import axios from 'axios';

const cache = new Map<number, ethers.providers.JsonRpcProvider | ethers.providers.WebSocketProvider>();
const failedRPCs = new Set<string>();

export function getChainProviderUrl(chainId: number) {
  const list = [getCustomizedRPC(chainId)?.rpc || (Providers[`${chainId}`] as string[])].flat();
  if (!list) {
    throw new Error(`Unsupported chain:${chainId}`);
  }

  const url = list.filter((rpc) => !failedRPCs.has(rpc))[0] || list[0];
  return url;
}

export function getChainProviderMaskUrl(chainId: number) {
  const url = getChainProviderUrl(chainId);
  if (url.includes('.infura.io')) {
    const comps = url.split('/');
    comps.pop();
    return comps.join('/');
  }

  return url;
}

export function getProviderByChainId(chainId: number) {
  if (cache.has(chainId)) {
    return cache.get(chainId);
  }

  const url = getChainProviderUrl(chainId);

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

export function saveCustomizedRPC(networkId: number, rpc: string, explorer: string) {
  const store = require('storejs');
  store.set(`customizedRPC-${networkId}`, { rpc, explorer });
  cache.delete(networkId);
}

function getCustomizedRPC(networkId: number) {
  if (!window) return undefined;
  const store = require('storejs');
  return store.get(`customizedRPC-${networkId}`) as { rpc: string; explorer: string };
}

export function broadcastEthTx(rawTx: string) {
  [
    'https://api-us.taichi.network:10001/rpc/public',
    'https://api-eu.taichi.network:10001/rpc/public',
    'https://api.taichi.network:10001/rpc/public',
  ].map((url) => {
    axios.post(url, { jsonrpc: '2.0', method: 'eth_sendRawTransaction', id: Date.now(), params: [rawTx] }).catch((_) => {});
  });
}

export async function sendTransaction(chainId: number, txHex: string) {
  const rpcs = Providers[`${chainId}`] as string[];

  const result = await Promise.any(
    rpcs.map(async (url) => {
      const resp = await axios.post(url, {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [txHex],
        id: Date.now(),
      });

      if (resp.data.error) {
        throw new Error(resp.data.error.message);
      }

      return resp.data as { id: number; result: string; error: { code: number; message: string } };
    })
  );

  if (chainId === 1) broadcastEthTx(txHex);
  console.log(result);

  return result;
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

      return Number.parseInt(baseFeePerGas[baseFeePerGas.length - 1]) + Gwei_1 / 100;
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
