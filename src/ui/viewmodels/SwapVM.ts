import { BigNumber, utils } from 'ethers';
import { autorun, makeAutoObservable, reaction, runInAction } from 'mobx';

import App from './Application';
import { ERC20Token } from '../../common/ERC20Token';
import { IToken } from '../../misc/Tokens';
import NetworksVM from './NetworksVM';
import Stableswap from './swap/Stableswap';

interface ISwapToken extends IToken {
  allowance?: BigNumber;
}

export class SwapVM {
  from: ISwapToken = undefined;
  for: ISwapToken = undefined;

  max = BigNumber.from(0);
  fromAmount = '';
  forAmount = '';
  slippage = 0.5;
  fee = 0.05;

  get currentExecutor() {
    return Stableswap;
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

  get account() {
    return App.currentWallet?.currentAccount.address;
  }

  get approved() {
    return this.from.allowance?.gte(utils.parseUnits(this.fromAmount, this.from.decimals));
  }

  constructor() {
    makeAutoObservable(this);

    this.selectFrom(this.fromList[0]);
    this.selectFor(this.forList[1]);

    reaction(
      () => NetworksVM.currentChainId,
      () => {
        this.selectFrom(this.fromList[0]);
        this.selectFor(this.forList[1]);
      }
    );
  }

  selectFrom(token: ISwapToken, check = true) {
    if (this.for?.address === token.address && check) {
      this.interchange();
      return;
    }

    this.from = token;
    if (!token) return;

    const erc20 = new ERC20Token(token.address, NetworksVM.currentProvider);

    erc20.balanceOf(this.account).then((balance) => {
      runInAction(() => (this.max = balance));
    });

    erc20.allowance(this.account, this.currentExecutor.address).then((allowance) => {
      token.allowance = allowance;
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

  async setFromAmount(value: string) {
    if (this.fromAmount === value) return;
    if (!this.from || !this.for) return;

    this.fromAmount = value;
    const amount = utils.parseUnits(value, this.from.decimals);

    const forAmount = await this.currentExecutor.getAmountOut(1337, this.from, this.for, amount);
    runInAction(() => (this.forAmount = utils.formatUnits(forAmount, this.for.decimals)));
  }
}

export default new SwapVM();
