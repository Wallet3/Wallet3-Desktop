import CheapStation from './CheapStation';
import EIP1559Price from './EIP1559Price';
import { Gwei_1 } from '../common/Constants';
import { Networks } from '../common/Networks';
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
  private _stations = new Map<number, IGasStation>(
    Networks.map((network) => {
      return [network.chainId, network.chainId === 1 ? EIP1559Price : new CheapStation(network.chainId)];
    })
  );

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
    EIP1559Price.refresh();
  }
}

export default new GasStation();
