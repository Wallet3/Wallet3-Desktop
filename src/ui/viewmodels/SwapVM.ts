import { BigNumber, utils } from 'ethers';
import { autorun, makeAutoObservable, reaction, runInAction } from 'mobx';

import App from './Application';
import CurveExecutor from './swap/CurveExecutor';
import { ERC20Token } from '../../common/ERC20Token';
import { IToken } from '../../misc/Tokens';
import NetworksVM from './NetworksVM';

interface ISwapToken extends IToken {}

export class SwapVM {
  from: ISwapToken = undefined;
  for: ISwapToken = undefined;
  max = BigNumber.from(0);
  fromAmount = '';
  forAmount = '';
  slippage = 0.5;
  fee = 0.05;

  get currentExecutor() {
    return CurveExecutor;
  }

  get fromList(): ISwapToken[] {
    return this.currentExecutor.fromTokens(NetworksVM.currentChainId).filter((t) => t.address !== this.from?.address);
  }

  get forList(): ISwapToken[] {
    return this.currentExecutor.forTokens(NetworksVM.currentChainId).filter((t) => t.address !== this.for?.address);
  }

  get isValid() {
    return Number(this.fromAmount) > 0 && this.from && this.for;
  }

  constructor() {
    makeAutoObservable(this);

    this.from = this.fromList[0];
    this.for = this.forList[1];

    reaction(
      () => NetworksVM.currentChainId,
      () => {
        this.from = this.fromList[0];
        this.for = this.forList[1];
      }
    );
  }

  selectFrom(token: ISwapToken, check = true) {
    if (this.for?.address === token.address && check) {
      this.interchange();
      return;
    }

    this.from = token;

    new ERC20Token(token.address, NetworksVM.currentProvider)
      .balanceOf(App.currentWallet.currentAccount.address)
      .then((balance) => {
        runInAction(() => (this.max = balance));
      });
  }

  selectFor(token: ISwapToken, check = true) {
    if (this.from?.address === token.address && check) {
      this.interchange();
      return;
    }

    this.for = token;
  }

  interchange() {
    const forToken = this.for;
    const fromToken = this.from;
    this.selectFrom(forToken, false);
    this.selectFor(fromToken, false);
  }

  setSlippage(value: number) {
    this.slippage = value;
  }

  setFromAmount(value: string) {
    this.fromAmount = value;
  }
}

export default new SwapVM();
