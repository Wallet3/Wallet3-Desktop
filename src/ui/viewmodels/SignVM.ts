import { RequestSignMessage, WcMessages } from '../../common/Messages';

import App from './Application';
import ipc from '../bridges/IPC';
import { makeAutoObservable } from 'mobx';

export class SignVM {
  signMsg: string[] = [];
  method = 'Sign';
  flag = 'edit';

  params: RequestSignMessage;

  constructor(params: RequestSignMessage) {
    makeAutoObservable(this);
    this.signMsg = params.raw;
    this.params = params;
  }

  async approveRequest(via: 'touchid' | 'passcode', passcode?: string) {
    let verified = false;
    switch (via) {
      case 'touchid':
        verified = await App.promptTouchID('Send Tx');
        break;
      case 'passcode':
        verified = await App.verifyPassword(passcode);
        break;
    }

    if (!verified) return false;

    ipc.invokeSecure(
      `${WcMessages.approveWcCallRequest(this.params.walletConnect.peerId, this.params.walletConnect.reqid)}`
    );

    return true;
  }

  rejectRequest() {
    ipc.invokeSecure(`${WcMessages.rejectWcCallRequest(this.params.walletConnect.peerId, this.params.walletConnect.reqid)}`);
  }
}
