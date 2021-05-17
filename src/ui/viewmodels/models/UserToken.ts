import { makeAutoObservable } from 'mobx';

export interface IUserToken {
  a: string; // contract address
  s: string; // symbol
  d: number; // decimals
  o: number; // order id
}

export class UserToken {
  private _id = '';
  private _amount = 0;
  private _symbol = '';
  private _name = '';
  private _decimals = 0;
  private _price = 0;
  private _wei = '0';
  private _show = true;
  private _order = -1;

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

  get show() {
    return this._show;
  }

  set show(value) {
    this._show = value;
  }

  get order() {
    return this._order;
  }

  set order(value) {
    this._order = value;
  }

  constructor(token?: IUserToken) {
    makeAutoObservable(this);

    if (token) {
      this._id = token.a;
      this._symbol = token.s;
      this._decimals = token.d;
      this._order = token.o;
    }
  }

  toObject(): IUserToken {
    return { a: this.id, s: this.symbol, d: this.decimals, o: this.order };
  }
}
