import axios, { AxiosResponse } from 'axios';
import { makeAutoObservable, runInAction } from 'mobx';

export class GasnowHttp {
  static async refresh() {
    let resp: AxiosResponse;

    try {
      resp = await axios.get(`https://www.gasnow.org/api/v3/gas/price?utm_source=imToken`);

      const { fast, rapid, standard, slow } = resp.data?.data;

      return {
        fast: Number.parseInt((fast / GasnowWs.gwei_1) as any),
        rapid: Number.parseInt((rapid / GasnowWs.gwei_1) as any),
        standard: Number.parseInt((standard / GasnowWs.gwei_1) as any),
        slow: Number.parseInt((slow / GasnowWs.gwei_1) as any),
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
    return Number.parseInt((this.rapid / GasnowWs.gwei_1) as any);
  }

  get fastGwei() {
    return Number.parseInt((this.fast / GasnowWs.gwei_1) as any);
  }

  get standardGwei() {
    return Number.parseInt((this.standard / GasnowWs.gwei_1) as any);
  }

  get slowGwei() {
    return Number.parseInt((this.slow / GasnowWs.gwei_1) as any);
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
