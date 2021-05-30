import { RequestSignMessage, WcMessages } from '../../common/Messages';

import App from './Application';
import crypto from '../bridges/Crypto';
import i18n from '../../i18n';
import ipc from '../bridges/IPC';
import { makeAutoObservable } from 'mobx';

export class SignVM {
  raw: string[] = [];
  method = 'Sign';
  flag = 'edit';
  msg = '';

  params: RequestSignMessage;

  constructor(params: RequestSignMessage) {
    makeAutoObservable(this);
    this.raw = params.raw;
    this.params = params;
    this.msg = params.msg;
  }

  async approveRequest(via: 'touchid' | 'passcode', passcode?: string) {
    let verified = false;
    switch (via) {
      case 'touchid':
        verified = await App.promptTouchID(i18n.t('Send Transaction'));
        break;
      case 'passcode':
        verified = await App.verifyPassword(passcode);
        break;
    }

    if (!verified) return false;

    await ipc.invokeSecure(
      `${WcMessages.approveWcCallRequest(this.params.walletConnect.peerId, this.params.walletConnect.reqid)}`,
      { password: via === 'passcode' ? App.hashPassword(passcode) : undefined, viaTouchID: via === 'touchid' }
    );

    return true;
  }

  rejectRequest() {
    ipc.invokeSecure(`${WcMessages.rejectWcCallRequest(this.params.walletConnect.peerId, this.params.walletConnect.reqid)}`);
  }
}
