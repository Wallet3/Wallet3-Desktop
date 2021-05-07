import { RequestSignMessage } from '../../common/Messages';
import { makeAutoObservable } from 'mobx';

export class SignVM {
  constructor(params: RequestSignMessage) {
    makeAutoObservable(this);
  }
}
