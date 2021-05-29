import { makeAutoObservable, runInAction } from 'mobx';

import { GasnowWs } from './Gasnow';
import axios from 'axios';

class PolygonGasStation {
  rapid: number;
  fast: number;
  standard: number;

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
    const resp = await axios.get(`https://gasstation-mainnet.matic.network`);
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
  }
}

export default new PolygonGasStation();
