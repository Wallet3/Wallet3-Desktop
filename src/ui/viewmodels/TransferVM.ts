import { GasnowHttp, GasnowWs } from '../../api/Gasnow';
import Messages, { CreateSendTx } from '../../common/Messages';
import { makeAutoObservable, reaction, runInAction } from 'mobx';

import { AccountVM } from './AccountVM';
import ERC20ABI from '../../abis/ERC20.json';
import { ITokenBalance } from '../../api/Debank';
import { ethers } from 'ethers';
import ipc from '../ipc/Bridge';
import { parseUnits } from 'ethers/lib/utils';
import provider from '../../common/Provider';

export class TransferVM {
  private readonly _accountVM: AccountVM;

  self = '';
  receipt: string = '';
  receiptAddress = '';
  isEns = false;
  amount: string = '';
  gas: number = 0;
  nonce: number = 0;
  gasPrice: number = -1; // Gwei

  get isValid() {
    try {
      const validAmount = this.amountBigInt.lte(
        parseUnits(this.selectedToken?.amount.toString() ?? '0', this.selectedToken?.decimals ?? 18)
      );

      return (
        this.receiptAddress &&
        this.receipt &&
        this.amount.length > 0 &&
        validAmount &&
        this.gas > 0 &&
        this.nonce >= 0 &&
        this.gasPrice > 0
      );
    } catch (error) {
      return false;
    }
  }

  get isERC20() {
    return this.selectedToken?.id.startsWith('0x') ?? false;
  }

  get amountBigInt() {
    return parseUnits(this.amount || '0', this.selectedToken?.decimals ?? 18);
  }

  selectedToken: ITokenBalance = null;
  receipts: { id: number; name: string }[] = [];

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

  setReceipt(addressOrName: string) {
    this.receipt = addressOrName;

    if (addressOrName.toLowerCase().endsWith('.eth') || addressOrName.toLowerCase().endsWith('.xyz')) {
      provider.resolveName(addressOrName).then((addr) => {
        if (!addr) return;

        runInAction(() => {
          this.isEns = true;
          this.receiptAddress = addr;
        });
      });

      return;
    }

    if (ethers.utils.isAddress(addressOrName)) {
      this.receiptAddress = addressOrName;
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

  setAmount(amount: string) {
    this.amount = amount;
  }

  private initGasPrice() {
    GasnowHttp.refresh().then(({ fast, rapid, standard }) => {
      runInAction(() => {
        this.fast = fast;
        this.rapid = rapid;
        this.standard = standard;
        this.gasPrice = fast;
      });
    });
  }

  private initNonce() {
    provider.getTransactionCount(this.self).then((nonce) => {
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

    const erc20 = new ethers.Contract(this.selectedToken.id, ERC20ABI, provider);
    const amt = parseUnits(this.amount || '0', this.selectedToken.decimals || 18);
    erc20.estimateGas
      .transferFrom(this.self, this.receiptAddress || '0xD1b05E3AFEDcb11F29c5A560D098170bE26Fe5f5', amt)
      .then((v) => {
        runInAction(() => (this.gas = Number.parseInt((v.toNumber() * 2) as any)));
      })
      .catch(() => {
        runInAction(() => (this.gas = 150_000));
      });
  }

  async sendTx() {
    const value = this.isERC20 ? 0 : this.amountBigInt.toString();

    const iface = new ethers.utils.Interface(ERC20ABI);
    const data = this.isERC20 ? '0x' : iface.encodeFunctionData('transfer', [this.receiptAddress, value]);

    await ipc.invokeSecure<void>(Messages.createSendTx, {
      to: this.receiptAddress,
      value,
      gas: this.gas,
      gasPrice: this.gasPrice * GasnowWs.gwei_1,
      nonce: this.nonce,
      data,
    } as CreateSendTx);
  }
}
