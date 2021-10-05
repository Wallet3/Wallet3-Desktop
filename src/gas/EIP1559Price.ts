import { computed, makeObservable, observable, runInAction } from 'mobx';
import { getMaxPriorityFee, getNextBlockBaseFee } from '../common/Provider';

import { Gwei_1 } from '../common/Constants';

class EIP1559Price {
  private timer: NodeJS.Timer;

  baseGasPrice = 0;

  get baseGasPriceGwei() {
    return Number((this.baseGasPrice / Gwei_1).toFixed(2));
  }

  priorityGasPrice = 0;

  get rapid() {
    return this.baseGasPrice * 2;
  }

  get fast() {
    return this.baseGasPrice;
  }

  get standard() {
    return this.baseGasPrice;
  }

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

  async refresh() {
    clearTimeout(this.timer);

    await this.fetchData();
    this.timer = setTimeout(() => this.refresh(), 15 * 1000);
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
