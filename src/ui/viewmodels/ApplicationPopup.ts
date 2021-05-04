import Messages, { CreateTransferTx, InitStatus, PopupWindowTypes } from '../../common/Messages';

import { Application } from './Application';
import { ConfirmVM } from './ConfirmVM';
import { createBrowserHistory } from 'history';
import ipc from '../bridges/IPC';

export class ApplicationPopup extends Application {
  readonly history = createBrowserHistory();
  type: PopupWindowTypes;

  async init() {
    super.init(false);

    ipc.once(Messages.initWindowType, (e, { type, payload }: { type: PopupWindowTypes; payload: CreateTransferTx }) => {
      this.type = type;

      switch (this.type) {
        case 'sendTx':
          this.implVM = new ConfirmVM(payload);
          this.history.push('/sendTx');
          break;
        case 'scanQR':
          this.history.push('/scanQR');
          break;
      }
    });
  }

  implVM: ConfirmVM;
}

export default new ApplicationPopup();
