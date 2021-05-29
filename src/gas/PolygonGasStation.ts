import { makeAutoObservable, runInAction } from 'mobx';

import { GasnowWs } from './Gasnow';
import axios from 'axios';

class PolygonGasStation {
  rapid: number = 0 * GasnowWs.gwei_1;
  fast: number = 0 * GasnowWs.gwei_1;
  standard: number = 0 * GasnowWs.gwei_1;

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

  async refresh() {
    try {
      axios.get(`https://gasstation-mainnet.matic.network`).then((resp) => {
        const { standard, fast, fastest } = resp.data as {
          safeLow: number; // Gwei
          standard: number; // Gwei
          fast: number;
          fastest: number;
          blockTime: number;
          blockNumber: number;
        };

        runInAction(() => {
          this.rapid = fastest * GasnowWs.gwei_1;
          this.fast = fast * GasnowWs.gwei_1;
          this.standard = standard * GasnowWs.gwei_1;
        });
      });
    } catch (error) {}
  }
}

export default new PolygonGasStation();
