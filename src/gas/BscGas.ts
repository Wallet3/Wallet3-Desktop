import { Gwei_1 } from './Gasnow';
import { makeAutoObservable } from 'mobx';

class BscGas {
  rapid = 10 * Gwei_1;
  fast = 5 * Gwei_1;
  standard = 5 * Gwei_1;

  get rapidGwei() {
    return this.rapid / Gwei_1;
  }

  get fastGwei() {
    return this.fast / Gwei_1;
  }

  get standardGwei() {
    return this.standard / Gwei_1;
  }

  constructor() {
    makeAutoObservable(this);
  }

  refresh() {}
}

export default new BscGas();
