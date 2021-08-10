import { makeAutoObservable, runInAction } from 'mobx';

import axios from 'axios';

interface Price {
  usd: number;
}

interface ChainsPrice {
  ethereum: Price;
  'huobi-token': Price;
  fantom: Price;
  'matic-network': Price;
  binancecoin: Price;
  okexchain: Price;
}

const host = 'https://api.coingecko.com';

export async function getPrice(ids = 'ethereum,matic-network,fantom,okexchain,huobi-token,binancecoin', currencies = 'usd') {
  try {
    const resp = await axios.get(`${host}/api/v3/simple/price?ids=${ids}&vs_currencies=${currencies}`);
    return resp.data as ChainsPrice;
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

        runInAction(() => {
          this.eth = ethereum.usd;
          this['1'] = ethereum.usd;
          this['10'] = ethereum.usd;
          this['42161'] = ethereum.usd;
          this['137'] = data['matic-network'].usd;
          this['100'] = 1;
          this['250'] = data.fantom.usd;
          this['128'] = data['huobi-token'].usd;
          this['66'] = data['huobi-token'].usd;
          this['56'] = data.binancecoin.usd;
        });
        run();
      })
      .catch(() => run());
  }
}

export default new Coingecko();
