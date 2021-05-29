import Messages, { ConfirmSendTx, PopupWindowTypes } from '../../common/Messages';

import { Application } from './Application';
import { ConfirmVM } from './ConfirmVM';
import { ConnectDappVM } from './ConnectDappVM';
import { SignVM } from './SignVM';
import ipc from '../bridges/IPC';

export class ApplicationPopup extends Application {
  type: PopupWindowTypes;

  constructor() {
    super();
  }

  async init() {
    super.init(false);

    ipc.once(Messages.initWindowType, (e, { type, payload }: { type: PopupWindowTypes; payload }) => {
      this.type = type;

      switch (this.type) {
        case 'sendTx':
          this.confirmVM = new ConfirmVM(payload as ConfirmSendTx);
          this.history.push('/sendTx');
          break;
        case 'scanQR':
          this.history.push('/scanQR');
          break;
        case 'connectDapp':
          this.connectDappVM = new ConnectDappVM(payload);
          this.history.push('/connectDapp');
          break;
        case 'sign':
          this.signVM = new SignVM(payload);
          this.history.push('/sign');
          break;
        case 'auth':
          this.history.push(`/auth/${payload.authId}`);
          break;
      }
    });
  }

  confirmVM?: ConfirmVM;
  connectDappVM?: ConnectDappVM;
  signVM?: SignVM;
}

export default new ApplicationPopup();
