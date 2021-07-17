import axios, { AxiosResponse } from 'axios';
import { makeAutoObservable, runInAction } from 'mobx';

import ws from 'ws';

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
  static readonly gwei_20 = 20000000000;
  static readonly gwei_1 = 1000000000;
  static readonly gwei_5 = 5000000000;
  static readonly host = 'wss://www.gasnow.org/ws';

  client: WebSocket | ws;
  rapid = 0;
  fast = 0;
  standard = 0;
  slow = 0;
  onclose?: () => void;

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

  restart(native = false) {
    this.stop();
    this.start(native);
  }

  start(native = false) {
    if (this.client) return;

    this.client = native ? new ws(GasnowWs.host) : new WebSocket(GasnowWs.host);

    const onmessage = (evt) => {
      const data = JSON.parse(evt.data);

      if (data.type) {
        runInAction(() => this.updatePrices(data.data));
      }
    };

    const onerror = () => {
      try {
        if (!this.client) return;
        this.client.close();
        this.client.onmessage = undefined;
        this.client.onerror = undefined;
        this.client.onclose = undefined;
        this.client = null;
        this.start();
      } catch (error) {}
    };

    const onclose = () => {
      if (!this.client) return;
      this.client.onmessage = undefined;
      this.client.onerror = undefined;
      this.client.onclose = undefined;
      this.client = null;
      this.onclose?.();
    };

    this.client.onmessage = onmessage;
    this.client.onerror = onerror;
    this.client.onclose = onclose;
  }

  stop() {
    if (!this.client) return;

    this.client.close();
    this.client.onmessage = undefined;
    this.client.onerror = undefined;
    this.client = undefined;
  }

  updatePrices = (data) => {
    if (!data) return;

    const { gasPrices } = data;
    if (!gasPrices) return;

    this.rapid = gasPrices.rapid;
    this.fast = gasPrices.fast;
    this.standard = gasPrices.standard;
    this.slow = gasPrices.slow;
  };

  refresh() {
    this.start();
  }
}

export default new GasnowWs();
