import { makeAutoObservable, reaction, runInAction } from 'mobx';

import { AccountVM } from './AccountVM';
import { GasnowHttp } from '../../api/Gasnow';
import { ITokenBalance } from '../../api/Debank';
import { ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import provider from '../../common/Provider';

export class TransferVM {
  private readonly _accountVM: AccountVM;

  receipt: string = '';
  isEns = false;
  address = '';
  amount: string = '';
  gas: number = 0;
  nonce: number = 0;
  gasPrice: number = -1; // Gwei

  get isValid() {
    try {
      const validAmount = parseUnits(this.amount || '0', this.selectedToken?.decimals ?? 18).lte(
        parseUnits(this.selectedToken?.amount.toString() ?? '0', this.selectedToken?.decimals ?? 18)
      );

      return this.address && this.receipt && validAmount && this.gas > 0 && this.nonce >= 0 && this.gasPrice > 0;
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

    this.initGasPrice();
  }

  setToken(token: ITokenBalance) {
    this.selectedToken = token;
    this.amount = '';
  }

  setReceipt(addressOrName: string) {
    this.receipt = addressOrName;

    if (addressOrName.toLowerCase().endsWith('.eth')) {
      provider.resolveName(addressOrName).then((addr) => {
        if (!addr) return;

        runInAction(() => {
          this.isEns = true;
          this.address = addr;
        });
      });

      return;
    }

    if (ethers.utils.isAddress(addressOrName)) {
      this.address = addressOrName;
    }

    this.isEns = false;
  }

  selectToken(id: string) {
    const token = this._accountVM.tokens.find((t) => t.id === id);
    this.selectedToken = token ?? this._accountVM.tokens[0];
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

  clean() {
    this.receipt = '';
    this.isEns = false;
    this.address = '';
  }
}
