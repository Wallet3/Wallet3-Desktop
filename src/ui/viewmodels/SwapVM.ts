import CurveExecutor from './swap/CurveExecutor';
import { IToken } from '../../misc/Tokens';
import NetworksVM from './NetworksVM';
import { makeAutoObservable } from 'mobx';

interface ISwapToken extends IToken {}

export class SwapVM {
  from: ISwapToken = undefined;
  for: ISwapToken = undefined;
  slippage = 0.5;
  fee = 0.05;

  get currentExecutor() {
    return CurveExecutor;
  }

  get fromList(): ISwapToken[] {
    return this.currentExecutor.fromTokens(NetworksVM.currentChainId);
  }

  get forList(): ISwapToken[] {
    return this.currentExecutor.forTokens(NetworksVM.currentChainId).filter((t) => t !== this.from);
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

  selectFor(token: ISwapToken) {
    this.for = token;

    if (this.from === token) {
      this.from = this.fromList[0];
    }
  }
}

export default new SwapVM();
