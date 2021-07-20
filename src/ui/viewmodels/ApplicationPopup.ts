import Messages, { ConfirmSendTx, PopupWindowTypes } from '../../common/Messages';

import { Application } from './Application';
import { ConfirmVM } from './popups/ConfirmVM';
import { ConnectDappVM } from './popups/ConnectDappVM';
import { MessageBoxVM } from './popups/MessageBoxVM';
import { SignVM } from './popups/SignVM';
import delay from 'delay';
import ipc from '../bridges/IPC';

export class ApplicationPopup extends Application {
  type: PopupWindowTypes;
  popupInitialized = false;

  constructor() {
    super();

    ipc.once(Messages.initWindowType, async (e, { type, payload }: { type: PopupWindowTypes; payload: any }) => {
      this.type = type;
      let count = 0;

      do {
        await delay(20);
        count++;
      } while (!this.popupInitialized && count < 20);

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
        case 'msgbox':
          this.msgboxVM = new MessageBoxVM(payload);
          this.history.push('/msgbox');
          break;
        case 'dapp-connecting':
          this.history.push('/connecting-dapp');
          break;
      }
    });
  }

  async init() {
    await super.init(false);
    this.popupInitialized = true;
  }

  confirmVM?: ConfirmVM;
  connectDappVM?: ConnectDappVM;
  signVM?: SignVM;
  msgboxVM?: MessageBoxVM;
}

export default new ApplicationPopup();
