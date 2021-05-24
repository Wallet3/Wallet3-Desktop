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
  timer?: NodeJS.Timeout;

  constructor() {
    makeAutoObservable(this);
  }

  start(delay: number = 25) {
    const run = () => {
      this.timer = setTimeout(() => this.start(delay), delay * 1000);
    };

    clearTimeout(this.timer);
    getPrice()
      .then((data) => {
        if (!data) {
          run();
          return;
        }

        const { ethereum } = data;
        runInAction(() => (this.eth = ethereum.usd));
        run();
      })
      .catch(() => run());
  }
}

export default new Coingecko();
