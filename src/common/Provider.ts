import * as Providers from './.wallet3.rc.json';
import * as ethers from 'ethers';

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

  const provider = ethers.providers.getDefaultProvider(list[0]);
  cache.set(chainId, provider);
  return provider;
}
