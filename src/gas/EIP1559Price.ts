import { computed, makeObservable, observable, runInAction } from 'mobx';
import { getMaxPriorityFee, getNextBlockBaseFee } from '../common/Provider';

export const Gwei_10 = 10000000000;
export const Gwei_20 = 20000000000;
export const Gwei_1 = 1000000000;
export const Gwei_5 = 5000000000;

export const MAX_GWEI_PRICE = 9007199;

class EIP1559Price {
  baseGasPrice = 0;

  get baseGasPriceGwei() {
    return Number((this.baseGasPrice / Gwei_1).toFixed(2));
  }

  priorityGasPrice = 0;

  get priorityGasPriceGwei() {
    return Number((this.priorityGasPrice / Gwei_1).toFixed(2));
  }

  get rapidGwei() {
    return Number.parseInt(((this.baseGasPrice * 2) / Gwei_1) as any);
  }

  get fastGwei() {
    return Number.parseInt((this.baseGasPrice / Gwei_1) as any);
  }

  get standardGwei() {
    return Math.max(Number.parseInt(((this.baseGasPrice - 2 * Gwei_1) / Gwei_1) as any), 1);
  }

  get slowGwei() {
    return Math.max(Number.parseInt(((this.baseGasPrice - 5 * Gwei_1) / Gwei_1) as any), 0);
  }

  constructor() {
    makeObservable(this, {
      baseGasPrice: observable,
      priorityGasPrice: observable,
      baseGasPriceGwei: computed,
      priorityGasPriceGwei: computed,
      rapidGwei: computed,
      fastGwei: computed,
      standardGwei: computed,
      slowGwei: computed,
    });
  }

  async start() {
    await this.fetchData();
    setTimeout(() => this.start(), 15 * 1000);
  }

  private async fetchData() {
    const [nextBlockFee, priorityFee] = await Promise.all([getNextBlockBaseFee(1), getMaxPriorityFee(1)]);

    runInAction(() => {
      this.baseGasPrice = nextBlockFee;
      this.priorityGasPrice = priorityFee;
    });
  }
}

export default new EIP1559Price();
