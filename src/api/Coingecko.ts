import { makeAutoObservable, runInAction } from 'mobx';

import axios from 'axios';

const host = 'https://api.coingecko.com';

export async function getPrice(ids = 'ethereum', currencies = 'usd') {
  try {
    const resp = await axios.get(`${host}/api/v3/simple/price?ids=${ids}&vs_currencies=${currencies}`);
    return resp.data as { [index: string]: { usd: number } };
  } catch (error) {
    return undefined;
  }
}

class Coingecko {
  eth: number = 0;

  constructor() {
    makeAutoObservable(this);
  }

  start() {
    getPrice()
      .then((data) => {
        if (!data) return;

        const { ethereum } = data;
        runInAction(() => (this.eth = ethereum.usd));
        setTimeout(() => this.start(), 15 * 1000);
      })
      .catch(() => {});
  }
}

export default new Coingecko();
