import { RequestSignMessage, WcMessages } from '../../common/Messages';

import ipc from '../bridges/IPC';
import { makeAutoObservable } from 'mobx';

export class SignVM {
  signMsg: string = '';
  method = 'Sign';
  flag = 'edit';

  params: RequestSignMessage;

  constructor(params: RequestSignMessage) {
    makeAutoObservable(this);
    this.signMsg = JSON.stringify(params.raw);
    this.params = params;
  }

  approveRequest({ passcode, viaTouchID }: { passcode?: string; viaTouchID?: boolean }) {
    ipc.invokeSecure(
      `${WcMessages.approveWcCallRequest(this.params.walletConnect.peerId, this.params.walletConnect.reqid)}`
    );
  }

  rejectRequest() {
    ipc.invokeSecure(`${WcMessages.rejectWcCallRequest(this.params.walletConnect.peerId, this.params.walletConnect.reqid)}`);
  }
}
