import { makeAutoObservable, reaction, runInAction } from 'mobx';

import { AccountVM } from './AccountVM';
import { GasnowHttp } from '../../api/Gasnow';
import { ITokenBalance } from '../../api/Debank';
import { ethers } from 'ethers';
import provider from '../../common/Provider';

export class TransferVM {
  private readonly _accountVM: AccountVM;

  receipt: string = '';
  isEns = false;
  address = '';
  amount: string = '';
  gas: number = 100000;
  nonce: number = 1;
  gasPrice: number = 20; // Gwei

  get isValid() {
    return this.address && Number.parseFloat(this.amount) > 0 && this.gas > 0 && this.nonce >= 0 && this.gasPrice > 0;
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

    this.refreshGasPrice();
  }

  setToken(token: ITokenBalance) {
    this.selectedToken = token;
    this.amount = '';
  }

  async setReceipt(addressOrName: string) {
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

  async refreshGasPrice() {
    GasnowHttp.refresh().then(({ fast, rapid, standard }) => {
      runInAction(() => {
        this.fast = fast;
        this.rapid = rapid;
        this.standard = standard;
      });
    });
  }
}
