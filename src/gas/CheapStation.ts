import { makeAutoObservable, runInAction } from 'mobx';

import { GasnowWs } from './Gasnow';
import { getProviderByChainId } from '../common/Provider';

export default class CheapStation {
  rapid = 5 * GasnowWs.gwei_1;
  fast = 1 * GasnowWs.gwei_1;
  standard = 1 * GasnowWs.gwei_1;

  chainId = 0;

  get rapidGwei() {
    return this.rapid / GasnowWs.gwei_1;
  }

  get fastGwei() {
    return this.fast / GasnowWs.gwei_1;
  }

  get standardGwei() {
    return this.standard / GasnowWs.gwei_1;
  }

  constructor(chainId: number) {
    makeAutoObservable(this);
    this.chainId = chainId;
  }

  async refresh() {
    const provider = getProviderByChainId(this.chainId);
    const gasPrice = await provider.getGasPrice();
    runInAction(() => (this.rapid = Math.max(gasPrice.toNumber(), 5 * GasnowWs.gwei_1)));
  }
}
