import { BigNumber, utils } from 'ethers';
import Messages, { ConfirmSendTx } from '../../common/Messages';
import { autorun, makeAutoObservable, reaction, runInAction } from 'mobx';

import App from './Application';
import { ERC20Token } from '../../common/ERC20Token';
import { IToken } from '../../misc/Tokens';
import NetworksVM from './NetworksVM';
import Stableswap from './swap/Stableswap';
import ipc from '../bridges/IPC';

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
    try {
      return this.from?.allowance?.gte(utils.parseUnits(this.fromAmount || '0', this.from.decimals || 0));
    } catch (error) {
      return false;
    }
  }

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => NetworksVM.currentChainId,
      () => this.init()
    );
  }

  init() {
    this.selectFrom(this.fromList[0]);
    this.selectFor(this.forList[1]);
  }

  selectFrom(token: ISwapToken, check = true) {
    if (this.for?.address === token?.address && check) {
      this.interchange();
      return;
    }

    this.from = token;
    if (!token) {
      this.max = BigNumber.from(0);
      return;
    }

    const erc20 = new ERC20Token(token.address, NetworksVM.currentProvider);

    erc20.balanceOf(this.account).then((balance) => {
      runInAction(() => (this.max = balance));
    });

    erc20.allowance(this.account, this.currentExecutor.address).then((allowance) => {
      token.allowance = allowance;
    });
  }

  selectFor(token: ISwapToken, check = true) {
    if (this.from?.address === token?.address && check) {
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

  async approve() {
    const erc20 = new ERC20Token(this.from.address, NetworksVM.currentProvider);
    const data = erc20.encodeApproveData(
      this.currentExecutor.address,
      '115792089237316195423570985008687907853269984665640564039457584007913129639935'
    );

    await ipc.invokeSecure<void>(Messages.sendTx, {
      from: this.account,
      to: this.from.address,
      value: '0',
      gas: 100_000,
      // gasPrice: this.gasPrice_Gwei * Gwei_1,
      // nonce: this.nonce,
      data,
      chainId: NetworksVM.currentChainId,
    } as ConfirmSendTx);
  }
}

export default new SwapVM();
