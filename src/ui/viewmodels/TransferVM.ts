import Gasnow, { GasnowHttp, GasnowWs } from '../../api/Gasnow';
import { IReactionDisposer, makeAutoObservable, reaction, runInAction } from 'mobx';
import Messages, { ConfirmSendTx } from '../../common/Messages';
import { ethers, utils } from 'ethers';
import { parseEther, parseUnits } from 'ethers/lib/utils';

import { AccountVM } from './AccountVM';
import ERC20ABI from '../../abis/ERC20.json';
import { ITokenBalance } from '../../api/Debank';
import NetworksVM from './NetworksVM';
import ipc from '../bridges/IPC';

export class TransferVM {
  private readonly _accountVM: AccountVM;
  private gasnowDisposer: IReactionDisposer;

  self = '';
  receipient: string = '';
  receiptAddress = '';
  isEns = false;
  amount: string = '';
  gas: number = 0;
  nonce: number = 0;
  gasPrice: number = -1; // Gwei
  gasLevel = 1; // 0 - rapid, 1 - fast, 2 - standard, 4 - custom
  sending = false;

  get isValid() {
    try {
      const validAmount = this.amountBigInt.lte(
        parseUnits(this.selectedToken?.amount.toString() ?? '0', this.selectedToken?.decimals ?? 18)
      );

      return (
        this.receiptAddress &&
        this.receipient &&
        this.amount.length > 0 &&
        validAmount &&
        this.gas >= 21000 &&
        this.gas < 12_500_000 &&
        this.nonce >= 0 &&
        this.gasPrice > 0 &&
        this.gasPrice <= 9007199 // MAX_SAFE_INTEGER * gwei_1
      );
    } catch (error) {
      return false;
    }
  }

  get insufficientFee() {
    const maxFee = Number.parseInt((this.gasPrice * GasnowWs.gwei_1 * this.gas || 0) as any);
    const balance = parseEther(this._accountVM?.nativeToken?.amount.toString() || '0');
    return balance.lt(maxFee.toString());
  }

  get isERC20() {
    return this.selectedToken?.id.startsWith('0x') ?? false;
  }

  get amountBigInt() {
    return parseUnits(this.amount || '0', this.selectedToken?.decimals ?? 18);
  }

  selectedToken: ITokenBalance = null;
  receipients: { id: number; name: string }[] = [];

  // Gwei
  rapid = 0;
  fast = 0;
  standard = 0;

  constructor(accountVM: AccountVM) {
    makeAutoObservable(this);
    this._accountVM = accountVM;
    this.selectedToken = accountVM.tokens[0];
    this.self = accountVM.address;

    this.initGasPrice();
    this.initNonce();
  }

  setReceipient(addressOrName: string) {
    this.receipient = addressOrName;

    if (addressOrName.toLowerCase().endsWith('.eth') || addressOrName.toLowerCase().endsWith('.xyz')) {
      NetworksVM.currentProvider.resolveName(addressOrName).then((addr) => {
        if (!addr) return;

        runInAction(() => {
          this.isEns = true;
          this.receiptAddress = addr;
        });
      });

      return;
    } else {
      this.receiptAddress = '';
    }

    if (ethers.utils.isAddress(addressOrName)) {
      this.receiptAddress = addressOrName;
    } else {
      this.receiptAddress = '';
    }

    this.isEns = false;
  }

  selectToken(id: string) {
    const token = this._accountVM.tokens.find((t) => t.id === id);
    this.selectedToken = token ?? this._accountVM.tokens[0];
    this.estimateGas();
  }

  setToken(token: ITokenBalance) {
    this.selectedToken = token;
    this.amount = '';
    this.estimateGas();
  }

  setGasPrice(price: number) {
    this.gasPrice = price;
  }

  setNonce(nonce: number) {
    this.nonce = nonce;
  }

  setGas(gas: number) {
    this.gas = gas;
  }

  setGasLevel(level: number) {
    this.gasLevel = level;
  }

  setAmount(amount: string) {
    this.amount = amount;
  }

  private initGasPrice() {
    Gasnow.start();

    this.gasnowDisposer = reaction(
      () => Gasnow.fast || Gasnow.rapid || Gasnow.standard,
      () => {
        this.rapid = Gasnow.rapidGwei;
        this.fast = Gasnow.fastGwei;
        this.standard = Gasnow.standardGwei;

        switch (this.gasLevel) {
          case 0:
            this.gasPrice = this.rapid;
            break;
          case 1:
            this.gasPrice = this.fast;
            break;
          case 2:
            this.gasPrice = this.standard;
            break;
        }
      }
    );
  }

  private initNonce() {
    NetworksVM.currentProvider.getTransactionCount(this.self).then((nonce) => {
      runInAction(() => (this.nonce = nonce));
    });
  }

  private estimateGas() {
    if (!this.selectToken) {
      this.gas = 21000;
      return;
    }

    if (!this.isERC20) {
      this.gas = 21000;
      return;
    }

    const erc20 = new ethers.Contract(this.selectedToken.id, ERC20ABI, NetworksVM.currentProvider);
    const amt = this.amountBigInt;
    erc20.estimateGas
      .transferFrom(this.self, this.receiptAddress || '0xD1b05E3AFEDcb11F29c5A560D098170bE26Fe5f5', amt)
      .then((v) => {
        runInAction(() => (this.gas = Number.parseInt((v.toNumber() * 2) as any)));
      })
      .catch(() => {
        runInAction(() => (this.gas = 150_000));
      });
  }

  dispose() {
    this.gasnowDisposer?.();
  }

  async sendTx() {
    if (this.sending) return;
    this.sending = true;

    const value = this.isERC20 ? 0 : this.amountBigInt.toString();
    const to = this.isERC20 ? this.selectedToken.id : this.receiptAddress;

    const iface = new ethers.utils.Interface(ERC20ABI);
    const data = this.isERC20 ? iface.encodeFunctionData('transfer', [this.receiptAddress, this.amountBigInt]) : '0x';

    await ipc.invokeSecure<void>(Messages.createTransferTx, {
      from: this._accountVM.address,
      to,
      value,
      gas: this.gas,
      gasPrice: this.gasPrice * GasnowWs.gwei_1,
      nonce: this.nonce,
      data,
      chainId: NetworksVM.currentChainId,

      receipient: {
        address: this.receiptAddress,
        name: this.isEns ? this.receipient : '',
      },

      transferToken: this.isERC20
        ? {
            symbol: this.selectedToken.display_symbol || this.selectedToken.symbol,
            decimals: this.selectedToken.decimals,
          }
        : undefined,
    } as ConfirmSendTx);

    this.sending = false;
  }
}
