import * as Providers from './.wallet3.rc.json';
import * as ethers from 'ethers';

// For bsc
// https://bscproject.org/#/rpcserver

const cache = new Map<number, ethers.providers.Provider>();

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
