import Coingecko from '../../../api/Coingecko';
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

    const savedCurrency = store.get(`w-currency`) || 'USD';
    this.currentCurrency = this.supportedCurrencies.find((c) => c.currency === savedCurrency);
  }

  setCurrency(currency: Currency) {
    this.currentCurrency = currency;
    store.set(`w-currency`, currency.currency);
  }

  format(usd: number) {
    let value = 0;
    switch (this.currentCurrency.currency) {
      case 'USD':
        value = usd;
        break;
      case 'ETH':
        value = usd / this.ethPrice;
        break;
    }

    const formatted = numeral(value).format('0,0.00');
    return `${this.currentCurrency.symbol} ${formatted === 'NaN' ? '0.00' : formatted}`.trim();
  }

  get ethPrice() {
    return Coingecko.eth || 1;
  }

  getPrice(chainId: number) {
    return Coingecko[chainId] || 1;
  }
}

export default new CurrencyVM();
