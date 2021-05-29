import Gasnow, { GasnowWs } from './Gasnow';
import { autorun, makeAutoObservable, reaction } from 'mobx';

import BscGas from './BscGas';
import PolygonGasStation from './PolygonGasStation';

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
    [137, PolygonGasStation],
    [56, BscGas],
    [80001, PolygonGasStation],
  ]);

  constructor() {
    makeAutoObservable(this);
  }

  get rapid() {
    return this.getGasPrice('rapid');
  }

  get fast() {
    return this.getGasPrice('fast');
  }

  get standard() {
    return this.getGasPrice('standard');
  }

  get rapidGwei() {
    return this.rapid / GasnowWs.gwei_1;
  }

  get fastGwei() {
    return this.fast / GasnowWs.gwei_1;
  }

  get standardGwei() {
    return this.standard / GasnowWs.gwei_1;
  }

  get chainId() {
    return this._chainId;
  }

  set chainId(chainId: number) {
    this._chainId = chainId;
  }

  getGasPrice(type: 'rapid' | 'fast' | 'standard') {
    const station = this._stations.get(this.chainId) ?? PolygonGasStation;

    switch (type) {
      case 'rapid':
        return station.rapid;
      case 'fast':
        return station.fast;
      case 'standard':
        return station.standard;
    }
  }

  refresh() {
    (this._stations.get(this.chainId) ?? PolygonGasStation).refresh();
  }
}

export default new GasStation();
