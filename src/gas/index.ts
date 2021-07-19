import Gasnow, { Gwei_1 } from './Gasnow';

import BscGas from './BscGas';
import CheapStation from './CheapStation';
import PolygonGasStation from './PolygonGasStation';
import { makeAutoObservable } from 'mobx';

interface IGasStation {
  rapid: number;
  fast: number;
  standard: number;
  rapidGwei: number;
  fastGwei: number;
  standardGwei: number;
  refresh(): void;
}

class GasStation {
  private _chainId = 1;
  private _stations = new Map<number, IGasStation>([
    [1, Gasnow],
    [100, new CheapStation(100)],
    [250, new CheapStation(250)],
    [128, new CheapStation(128)],
    [137, PolygonGasStation],
    [66, new CheapStation(66)],
    [56, BscGas],
    [3, new CheapStation(3)],
    [4, new CheapStation(4)],
    [5, new CheapStation(5)],
    [42, new CheapStation(42)],
    [80001, new CheapStation(80001)],
  ]);

  constructor() {
    makeAutoObservable(this);
  }

  get rapid(): number {
    return this.getGasPrice(this.chainId, 'rapid');
  }

  get fast(): number {
    return this.getGasPrice(this.chainId, 'fast');
  }

  get standard(): number {
    return this.getGasPrice(this.chainId, 'standard');
  }

  get rapidGwei() {
    return this.rapid / Gwei_1;
  }

  get fastGwei() {
    return this.fast / Gwei_1;
  }

  get standardGwei() {
    return this.standard / Gwei_1;
  }

  get chainId() {
    return this._chainId;
  }

  set chainId(chainId: number) {
    this._chainId = chainId;
  }

  getGasPrice(chainId = this.chainId, type: 'rapid' | 'fast' | 'standard') {
    const station = this._stations.get(chainId);

    switch (type) {
      case 'rapid':
        return station?.rapid ?? 5 * Gwei_1;
      case 'fast':
        return station?.fast ?? 1 * Gwei_1;
      case 'standard':
        return station?.standard ?? 1 * Gwei_1;
    }
  }

  refresh() {
    this._stations.get(this.chainId)?.refresh();
    Gasnow.refresh();
  }
}

export default new GasStation();
