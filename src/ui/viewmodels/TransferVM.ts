import { makeAutoObservable, reaction, runInAction } from 'mobx';

import { AccountVM } from './AccountVM';
import ERC20ABI from '../../abis/ERC20.json';
import { GasnowHttp } from '../../api/Gasnow';
import { ITokenBalance } from '../../api/Debank';
import { ethers } from 'ethers';
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
      const validAmount = parseUnits(this.amount || '0', this.selectedToken?.decimals ?? 18).lte(
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

  initGasPrice() {
    GasnowHttp.refresh().then(({ fast, rapid, standard }) => {
      runInAction(() => {
        this.fast = fast;
        this.rapid = rapid;
        this.standard = standard;
        this.gasPrice = fast;
      });
    });
  }

  initNonce() {
    provider.getTransactionCount(this.self).then((nonce) => {
      runInAction(() => (this.nonce = nonce));
    });
  }

  estimateGas() {
    if (!this.selectToken) {
      this.gas = 21000;
      return;
    }

    if (!this.selectedToken.id.startsWith('0x')) {
      this.gas = 21000;
      return;
    }

    const erc20 = new ethers.Contract(this.selectedToken.id, ERC20ABI, provider);
    const amt = parseUnits(this.amount || '0', this.selectedToken.decimals || 18);
    erc20.estimateGas
      .transferFrom(this.self, this.receiptAddress || '0xD1b05E3AFEDcb11F29c5A560D098170bE26Fe5f5', amt)
      .then((v) => {
        runInAction(() => (this.gas = Number.parseInt((v.toNumber() * 1.5) as any)));
      })
      .catch(() => {
        runInAction(() => (this.gas = 100_000));
      });
  }
}
