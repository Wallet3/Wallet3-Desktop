import { makeAutoObservable, runInAction } from 'mobx';

import { Gwei_1 } from './Gasnow';
import axios from 'axios';

class PolygonGasStation {
  rapid: number = 7 * Gwei_1;
  fast: number = 3 * Gwei_1;
  standard: number = 1 * Gwei_1;

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
          this.rapid = Math.min(Math.max(fastest, 1) * Gwei_1, 1000 * Gwei_1);
          this.fast = Math.min(Math.max(fast, 1) * Gwei_1, 200 * Gwei_1);
          this.standard = Math.min(Math.max(standard, 1) * Gwei_1, 100 * Gwei_1);
        });
      });
    } catch (error) {}
  }
}

export default new PolygonGasStation();
