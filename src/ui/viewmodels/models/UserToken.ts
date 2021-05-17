import { makeAutoObservable } from 'mobx';

export interface IUserToken {
  a: string; // contract address
  s: string; // symbol
  d: number; // decimals
}

export class UserToken {
  _id = '';
  _amount = 0;
  _symbol = '';
  _name = '';
  _decimals = 0;
  _price = 0;
  _wei = '0';

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get amount() {
    return this._amount;
  }

  set amount(value) {
    this._amount = value;
  }

  get symbol() {
    return this._symbol;
  }

  set symbol(value) {
    this._symbol = value;
  }

  get name() {
    return this._name;
  }

  set name(value) {
    this._name = value;
  }

  get decimals() {
    return this._decimals;
  }

  set decimals(value) {
    this._decimals = value;
  }

  get price() {
    return this._price;
  }

  set price(value) {
    this._price = value;
  }

  get wei() {
    return this._wei;
  }

  set wei(value) {
    this._wei = value;
  }

  constructor(token?: IUserToken) {
    makeAutoObservable(this);

    if (token) {
      this._id = token.a;
      this._symbol = token.s;
      this._decimals = token.d;
    }
  }

  toObject(): IUserToken {
    return { a: this.id, s: this.symbol, d: this.decimals };
  }
}
