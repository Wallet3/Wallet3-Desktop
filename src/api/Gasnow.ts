import axios, { AxiosResponse } from 'axios';
import { makeAutoObservable, runInAction } from 'mobx';

export class GasnowHttp {
  static async refresh() {
    let resp: AxiosResponse;

    try {
      resp = await axios.get(`https://www.gasnow.org/api/v3/gas/price?utm_source=imToken`);

      const { fast, rapid, standard, slow } = resp.data?.data;

      return {
        fast: fast / GasnowWs.gwei_1,
        rapid: rapid / GasnowWs.gwei_1,
        standard: standard / GasnowWs.gwei_1,
        slow: standard / GasnowWs.gwei_1,
      };
    } catch (error) {
      return {
        fast: 0,
        rapid: 0,
        standard: 0,
        slow: 0,
      };
    }
  }
}

export class GasnowWs {
  static readonly gwei_10 = 10000000000;
  static readonly gwei_200 = 200000000000;
  static readonly gwei_1 = 1000000000;

  onError?: () => void;
  client: WebSocket;
  rapid = GasnowWs.gwei_10 * 2;
  fast = GasnowWs.gwei_10 * 2;
  standard = GasnowWs.gwei_10;
  slow = GasnowWs.gwei_1;

  get rapidGwei() {
    return this.rapid / GasnowWs.gwei_1;
  }

  get fastGwei() {
    return this.fast / GasnowWs.gwei_1;
  }

  get standardGwei() {
    return this.standard / GasnowWs.gwei_1;
  }

  get slowGwei() {
    return this.slow / GasnowWs.gwei_1;
  }

  constructor() {
    makeAutoObservable(this);
  }

  start() {
    this.client = new WebSocket('wss://www.gasnow.org/ws');
    const onmessage = (evt) => {
      const data = JSON.parse(evt.data);

      if (data.type) {
        runInAction(() => this.updatePrices(data.data));
      }
    };

    const onerror = () => {
      try {
        this.client.close();
        this.client.removeEventListener('error', onerror);
        this.client.removeEventListener('message', onmessage);
        this.onError?.();
      } catch (error) {}
    };

    this.client.onmessage = onmessage;
    this.client.onerror = onerror;
  }

  updatePrices = (data) => {
    if (!data) return;

    const { gasPrices } = data;
    this.rapid = gasPrices.rapid;
    this.fast = gasPrices.fast;
    this.standard = gasPrices.standard;
    this.slow = gasPrices.slow;
  };
}

export default new GasnowWs();
