import { makeAutoObservable, runInAction } from 'mobx';

import { Gwei_1 } from './Gasnow';
import { getProviderByChainId } from '../common/Provider';

export default class CheapStation {
  rapid = 5 * Gwei_1;
  fast = 1 * Gwei_1;
  standard = 1 * Gwei_1;

  chainId = 0;

  get rapidGwei() {
    return this.rapid / Gwei_1;
  }

  get fastGwei() {
    return this.fast / Gwei_1;
  }

  get standardGwei() {
    return this.standard / Gwei_1;
  }

  constructor(chainId: number) {
    makeAutoObservable(this);
    this.chainId = chainId;
  }

  async refresh() {
    const provider = getProviderByChainId(this.chainId);
    const gasPrice = await provider.getGasPrice();
    runInAction(() => (this.rapid = Math.max(gasPrice.toNumber(), 5 * Gwei_1)));
  }
}
