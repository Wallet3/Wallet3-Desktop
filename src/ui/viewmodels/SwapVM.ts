import { DAI, IToken, USDC, USDT, sUSD } from '../../misc/Tokens';

import CurveExecutor from './swap/CurveExecutor';
import NetworksVM from './NetworksVM';
import { makeAutoObservable } from 'mobx';

interface ISwapToken extends IToken {}

export class SwapVM {
  from: ISwapToken = undefined;
  for: ISwapToken = undefined;

  get fromList(): ISwapToken[] {
    return CurveExecutor.tokens(NetworksVM.currentChainId);
  }

  get forList(): ISwapToken[] {
    return this.fromList.filter((t) => t !== this.from);
  }

  constructor() {
    makeAutoObservable(this);
  }

  selectFrom(token: ISwapToken) {
    this.from = token;
    
    if (this.for === token) {
      this.for = this.forList[0];
    }
  }

  selectFor(token: ISwapToken) {}
}
