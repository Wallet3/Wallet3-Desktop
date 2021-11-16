import { BigNumber, providers, utils } from 'ethers';
import { Gwei_1, MAX_GWEI_PRICE } from '../common/Constants';
import { computed, makeAutoObservable, observable, runInAction } from 'mobx';
import { getGasPrice, getMaxPriorityFee, getNextBlockBaseFee, getTransactionCount } from '../common/RPC';

import App from './App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ERC20Token } from '../models/ERC20';
import { INetwork } from '../common/Networks';
import { IToken } from '../common/Tokens';
import Networks from './Networks';

export class Transferring {
  private timer?: NodeJS.Timer;

  to = '';
  avatar?: string = '';
  toAddress = '';
  token: IToken;
  amount = '0';
  isResolvingAddress = false;
  isEstimatingGas = false;
  gasLimit = 21000;
  nextBlockBaseFeeWei = 0;
  maxGasPrice = 0; // Gwei
  maxPriorityPrice = 0; // Gwei
  nonce = -1;
  txException = '';
  readonly network: INetwork;

  get currentAccount() {
    return App.currentWallet?.currentAccount!;
  }

  get allTokens() {
    return [this.currentAccount.tokens[0], ...this.currentAccount.allTokens];
  }

  get isEns() {
    return !utils.isAddress(this.to);
  }

  get isValidAddress() {
    return utils.isAddress(this.toAddress);
  }

  get amountWei() {
    try {
      if (this.isNativeToken) {
        const ether = utils.parseEther(this.amount);
        if (ether.eq(this.currentAccount.nativeToken.balance!)) {
          return BigNumber.from(this.currentAccount.nativeToken.balance!).sub(this.txFeeWei);
        }
      }

      return utils.parseUnits(this.amount, this.token.decimals || 18);
    } catch (error) {}

    return BigNumber.from(0);
  }

  get isValidAmount() {
    try {
      return this.amountWei.gt(0) && this.amountWei.lte(this.token.balance!) && !this.token.loading;
    } catch (error) {
      return false;
    }
  }

  get nextBlockBaseFee() {
    return this.nextBlockBaseFeeWei / Gwei_1;
  }

  get txFeeWei() {
    return this.network.eip1559
      ? BigNumber.from(this.nextBlockBaseFeeWei)
          .add(BigNumber.from((Number(this.maxPriorityPrice.toFixed(9)) * Gwei_1).toFixed(0)))
          .mul(this.gasLimit)
      : BigNumber.from((this.maxGasPrice * Gwei_1).toFixed(0)).mul(this.gasLimit);
  }

  get txFee() {
    try {
      return Number(utils.formatEther(this.txFeeWei));
    } catch (error) {
      return 0;
    }
  }

  get feeTokenSymbol() {
    return this.network.symbol;
  }

  get isNativeToken() {
    return !this.token.address;
  }

  get insufficientFee() {
    return this.isNativeToken
      ? this.amountWei.add(this.txFeeWei).gt(this.currentAccount.nativeToken.balance!)
      : this.txFeeWei.gt(this.currentAccount.nativeToken.balance!);
  }

  get isValidParams() {
    return (
      this.toAddress &&
      this.isValidAmount &&
      this.nonce >= 0 &&
      this.maxGasPrice > 0 &&
      this.gasLimit >= 21000 &&
      this.network &&
      !this.insufficientFee &&
      !this.token.loading &&
      !this.isEstimatingGas
    );
  }

  get txRequest(): providers.TransactionRequest {
    const data = this.isNativeToken ? '0x' : (this.token as ERC20Token).encodeTransferData(this.toAddress, this.amountWei);

    const tx: providers.TransactionRequest = {
      chainId: this.network.chainId,
      from: this.currentAccount.address,
      to: this.isNativeToken ? this.toAddress : this.token.address,
      value: this.isNativeToken ? this.amountWei : 0,
      nonce: this.nonce,
      data,
      gasLimit: this.gasLimit,
      type: this.network.eip1559 ? 2 : 0,
    };

    if (tx.type === 0) {
      tx.gasPrice = Number.parseInt((this.maxGasPrice * Gwei_1) as any);
    } else {
      tx.maxFeePerGas = Number.parseInt((this.maxGasPrice * Gwei_1) as any);
      tx.maxPriorityFeePerGas = Number.parseInt((this.maxPriorityPrice * Gwei_1) as any);
    }

    return tx;
  }

  constructor({ targetNetwork, defaultToken, to }: { targetNetwork: INetwork; defaultToken?: IToken; to?: string }) {
    this.network = targetNetwork;
    this.token = defaultToken || this.currentAccount.tokens[0];

    makeAutoObservable(this, {
      token: observable,
      txFeeWei: computed,
      txFee: computed,
      nextBlockBaseFee: computed,
      dispose: false,
    });

    AsyncStorage.getItem(`${this.network.chainId}-LastUsedToken`).then((v) => {
      if (defaultToken) return;

      if (!v) {
        runInAction(() => this.setToken(this.currentAccount.tokens[0]));
        return;
      }

      const token = this.currentAccount.allTokens.find((t) => t.address === v) || this.currentAccount.tokens[0];
      runInAction(() => this.setToken(token));
    });

    this.initChainData();

    if (to) this.setTo(to);

    if (this.network.eip1559) {
      this.timer = setTimeout(() => this.refreshEIP1559(), 1000 * 10);
    }
  }

  private async initChainData() {
    const { chainId } = this.network;
    const [gasPrice, nextBaseFee, priorityFee, nonce] = await Promise.all([
      getGasPrice(chainId),
      getNextBlockBaseFee(chainId),
      getMaxPriorityFee(chainId),
      getTransactionCount(chainId, this.currentAccount.address),
    ]);

    runInAction(() => {
      this.nextBlockBaseFeeWei = Number(nextBaseFee.toFixed(0));

      const priFee = (priorityFee || Gwei_1) / Gwei_1 + 0.1;

      this.setNonce(nonce);
      this.setPriorityPrice(priFee);

      if (this.network.eip1559) {
        this.setMaxGasPrice((nextBaseFee || Gwei_1) / Gwei_1 + priFee + 3);
      } else {
        this.setMaxGasPrice((gasPrice || Gwei_1) / Gwei_1);
      }
    });
  }

  private refreshEIP1559() {
    getNextBlockBaseFee(this.network.chainId).then((nextBaseFee) => {
      runInAction(() => (this.nextBlockBaseFeeWei = nextBaseFee));
      this.timer = setTimeout(() => this.refreshEIP1559(), 1000 * 10);
    });
  }

  async estimateGas() {
    if (!this.toAddress) return;

    this.isEstimatingGas = true;
    const { gas, errorMessage } = await (this.token as ERC20Token).estimateGas(this.toAddress, this.amountWei);
    runInAction(() => {
      this.isEstimatingGas = false;
      this.setGasLimit(gas || 0);
      this.txException = errorMessage || '';
    });
  }

  async setTo(to: string, avatar?: string) {
    to = to.trim();
    this.avatar = avatar;

    if (this.to.toLowerCase() === to.toLowerCase()) return;

    this.to = to;
    this.toAddress = '';
    this.txException = '';

    if (utils.isAddress(to)) {
      this.toAddress = to;
      this.isResolvingAddress = false;
      return;
    }

    if (!to.endsWith('.eth')) return;
    let provider = Networks.MainnetWsProvider;

    this.isResolvingAddress = true;
    const address = await provider.resolveName(to);

    runInAction(() => {
      this.toAddress = address || '';
      this.isResolvingAddress = false;
      provider.destroy();
    });
  }

  setToken(token: IToken) {
    if (this.token.address === token.address) return;

    this.token = token;
    this.txException = '';

    (token as ERC20Token)?.getBalance?.(false);
    AsyncStorage.setItem(`${this.network.chainId}-LastUsedToken`, token.address);
  }

  setAmount(amount: string) {
    this.amount = amount;
    this.txException = '';
  }

  setNonce(nonce: string | number) {
    this.nonce = Number(nonce);
  }

  setGasLimit(limit: string | number) {
    try {
      this.gasLimit = Math.max(Math.min(Number.parseInt(limit as any), 100_000_000), 21000);
    } catch (error) {}
  }

  setMaxGasPrice(price: string | number) {
    try {
      this.maxGasPrice = Math.max(Math.min(Number(price), MAX_GWEI_PRICE), 0);
    } catch {}
  }

  setPriorityPrice(price: string | number) {
    try {
      this.maxPriorityPrice = Math.max(Math.min(Number(price), MAX_GWEI_PRICE), 0);
    } catch (error) {}
  }

  async setGas(speed: 'rapid' | 'fast' | 'standard') {
    const wei = (await getGasPrice(this.network.chainId)) || Gwei_1;
    const basePrice = wei / Gwei_1;

    runInAction(() => {
      switch (speed) {
        case 'rapid':
          this.setMaxGasPrice(basePrice + (this.network.eip1559 ? this.maxPriorityPrice : 0) + 10);
          break;
        case 'fast':
          this.setMaxGasPrice(basePrice);
          break;
        case 'standard':
          this.setMaxGasPrice(Math.max(basePrice - 3, 1));
          break;
      }
    });
  }

  dispose() {
    clearTimeout(this.timer as any);
  }
}