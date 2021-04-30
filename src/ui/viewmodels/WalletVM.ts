import { makeAutoObservable } from 'mobx';

class WalletVM {
  constructor() {
    makeAutoObservable(this);
  }
}
