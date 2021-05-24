import { makeAutoObservable } from 'mobx';
import store from 'storejs';

interface Currency {
  currency: string;
  symbol: string;
  flag: string;
}

export class CurrencyVM {
  currentCurrency: Currency = null;

  supportedCurrencies: Currency[] = [
    { currency: 'USD', symbol: '$', flag: 'usa' },
    { currency: 'ETH', symbol: 'Ξ', flag: 'eth' },
  ];

  constructor() {
    makeAutoObservable(this);

    this.currentCurrency = this.supportedCurrencies.find((c) => c.currency === (store.get('currency') || 'USD'));
  }

  setCurrency(currency: Currency) {
    this.currentCurrency = currency;
    store.set('currency', currency.currency);
  }
}

export default new CurrencyVM();
