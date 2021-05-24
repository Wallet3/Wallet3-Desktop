import Coingecko from '../../api/Coingecko';
import { makeAutoObservable } from 'mobx';
import numeral from 'numeral';
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

  format(usd: number) {
    let value = 0;
    switch (this.currentCurrency.currency) {
      case 'USD':
        value = usd;
        break;
      case 'ETH':
        value = usd / Coingecko.eth;
        break;
    }

    const formatted = numeral(value).format('0,0.00');
    return `${this.currentCurrency.symbol} ${formatted === 'NaN' ? '0.00' : formatted}`.trim();
  }
}

export default new CurrencyVM();
