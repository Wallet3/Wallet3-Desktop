import { GasnowWs } from './Gasnow';
import { makeAutoObservable } from 'mobx';

class BscGas {
  rapid = 10 * GasnowWs.gwei_1;
  fast = 5 * GasnowWs.gwei_1;
  standard = 5 * GasnowWs.gwei_1;

  get rapidGwei() {
    return this.rapid / GasnowWs.gwei_1;
  }

  get fastGwei() {
    return this.fast / GasnowWs.gwei_1;
  }

  get standardGwei() {
    return this.standard / GasnowWs.gwei_1;
  }

  constructor() {
    makeAutoObservable(this);
  }

  refresh() {}
}

export default new BscGas();
