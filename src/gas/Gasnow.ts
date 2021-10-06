import { makeAutoObservable, runInAction } from 'mobx';

// import ws from 'ws';

export const Gwei_10 = 10000000000;
export const Gwei_20 = 20000000000;
export const Gwei_1 = 1000000000;
export const Gwei_5 = 5000000000;

export const MAX_GWEI_PRICE = 9007199;

class GasnowWs {
  static readonly host = 'wss://www.gasnow.org/ws';

  client: WebSocket;
  rapid = 0;
  fast = 0;
  standard = 0;
  slow = 0;
  onclose?: () => void;

  get rapidGwei() {
    return Number.parseInt((this.rapid / Gwei_1) as any);
  }

  get fastGwei() {
    return Number.parseInt((this.fast / Gwei_1) as any);
  }

  get standardGwei() {
    return Number.parseInt((this.standard / Gwei_1) as any);
  }

  get slowGwei() {
    return Number.parseInt((this.slow / Gwei_1) as any);
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

    // this.client = native ? new ws(GasnowWs.host) : new WebSocket(GasnowWs.host);
    this.client = new WebSocket(GasnowWs.host);

    const onmessage = (evt) => {
      const data = JSON.parse(evt.data);

      if (data.type) {
        runInAction(() => this.updatePrices(data.data));
      }
    };

    const onerror = () => {
      try {
        this.stop();
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
    this.client?.close();
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

// export default new GasnowWs();
