import { BigNumber, providers, utils } from 'ethers';
import Messages, { ConfirmSendTx } from '../../common/Messages';
import { autorun, makeAutoObservable, reaction, runInAction } from 'mobx';

import App from './Application';
import { ERC20Token } from '../../common/ERC20Token';
import { Gwei_1 } from '../../gas/Gasnow';
import { IToken } from '../../misc/Tokens';
import NetworksVM from './NetworksVM';
import Stableswap from './swap/Stableswap';
import delay from 'delay';
import ipc from '../bridges/IPC';
import { sendTx } from './services/Tx';

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

  private isApproving = new Map<number, boolean>();
  private isSwapping = new Map<number, boolean>();

  get approving() {
    return this.isApproving.get(NetworksVM.currentChainId);
  }

  get swapping() {
    return this.isSwapping.get(NetworksVM.currentChainId);
  }

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
    try {
      return (
        this.max.gte(utils.parseUnits(this.fromAmount || '0', this.from.decimals)) &&
        Number(this.fromAmount) > 0 &&
        this.from &&
        this.for
      );
    } catch (error) {
      return false;
    }
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
    this.forAmount = '';
    this.fromAmount = '';
    this.selectFrom(this.fromList[0]);
    this.selectFor(this.forList[1]);
  }

  selectFrom(token: ISwapToken, check = true) {
    if (this.for?.address === token?.address && check) {
      this.interchange();
      return;
    }

    this.fromAmount = '';
    this.from = token;
    if (!token) {
      this.max = BigNumber.from(0);
      return;
    }

    const erc20 = new ERC20Token(token.address, NetworksVM.currentProvider);

    erc20.balanceOf(this.account).then((balance) => {
      runInAction(() => (this.max = balance));
    });

    erc20.allowance(this.account, this.currentExecutor.getContractAddress(NetworksVM.currentChainId)).then((allowance) => {
      runInAction(() => (this.from.allowance = allowance));
    });
  }

  selectFor(token: ISwapToken, check = true) {
    if (this.from?.address === token?.address && check) {
      this.interchange();
      return;
    }

    this.forAmount = '';
    this.for = token;
    this.setFromAmount(this.fromAmount);
  }

  interchange() {
    this.max = BigNumber.from(0);
    this.fromAmount = this.forAmount = '';

    const forToken = this.for;
    const fromToken = this.from;

    this.selectFrom(forToken, false);
    this.selectFor(fromToken, false);
  }

  setSlippage(value: number) {
    this.slippage = value;
  }

  async setFromAmount(value: string) {
    if (!this.from || !this.for) return;

    this.fromAmount = value;
    const amount = utils.parseUnits(value, this.from.decimals);

    const forAmount = await this.currentExecutor.getAmountOut(NetworksVM.currentChainId, this.from, this.for, amount);
    runInAction(() => (this.forAmount = utils.formatUnits(forAmount, this.for.decimals)));
  }

  private async awaitTx({ provider, nonce, chainId }: { chainId: number; nonce: number; provider: providers.BaseProvider }) {
    await delay(1200);

    const tx = App.currentWallet?.pendingTxs.find((tx) => tx.from === this.account && tx.nonce === nonce);

    while (tx) {
      await delay(3000);
      const receipt = await provider.getTransactionReceipt(tx.hash);
      if (receipt) break;
    }

    runInAction(() => {
      this.isApproving.set(chainId, false);
      this.isSwapping.set(chainId, false);
    });
  }

  async approve() {
    const provider = NetworksVM.currentProvider;
    const chainId = NetworksVM.currentChainId;
    const token = this.from;

    runInAction(() => this.isApproving.set(chainId, true));

    const erc20 = new ERC20Token(token.address, provider);
    const data = erc20.encodeApproveData(
      this.currentExecutor.getContractAddress(NetworksVM.currentChainId),
      '115792089237316195423570985008687907853269984665640564039457584007913129639935'
    );

    const { nonce } = await sendTx({
      chainId,
      provider,
      from: this.account,
      to: this.from.address,
      value: '0',
      gas: 150_000,
      data,
    });

    await this.awaitTx({ provider, nonce, chainId });

    const allowance = await erc20.allowance(this.account, this.currentExecutor.getContractAddress(NetworksVM.currentChainId));

    runInAction(() => {
      token.allowance = allowance;
    });
  }

  async swap() {
    const provider = NetworksVM.currentProvider;
    const chainId = NetworksVM.currentChainId;

    runInAction(() => this.isSwapping.set(chainId, true));

    const amountIn = utils.parseUnits(this.fromAmount || '0', this.from.decimals || 0);
    const minOut = utils
      .parseUnits(this.forAmount || '0', this.for.decimals || 0)
      .mul(this.slippage * 10)
      .div(1000);

    const data = this.currentExecutor.encodeSwapData(NetworksVM.currentChainId, this.from, this.for, amountIn, minOut);

    const { nonce } = await sendTx({
      chainId,
      from: this.account,
      to: this.currentExecutor.getContractAddress(chainId),
      value: '0',
      gas: 900_000,
      data,
      provider,
    });

    await this.awaitTx({ nonce, provider, chainId });

    runInAction(() => {
      this.selectFrom(this.from, false);
      this.selectFor(this.for, false);
    });
  }
}

export default new SwapVM();
