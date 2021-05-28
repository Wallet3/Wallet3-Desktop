import axios from 'axios';
import { makeAutoObservable } from 'mobx';

class PolygonGasStation {
  constructor() {
    makeAutoObservable(this);
  }

  async refresh() {
    const resp = await axios.get(`https://gasstation-mainnet.matic.network`);
    resp.data as {
      safeLow: number; // Gwei
      standard: number; // Gwei
      fast: number;
      fastest: number;
      blockTime: 2;
      blockNumber: 15026193;
    };
  }
}
