import Messages, { CreateSendTx, PopupWindowTypes } from '../../common/Messages';

import { SendTxVM } from './SendTxVM';
import { createBrowserHistory } from 'history';
import ipc from '../ipc/Bridge';

export class ApplicationPopup {
  readonly history = createBrowserHistory();
  type: PopupWindowTypes;

  init() {
    ipc.once(Messages.initWindowType, (e, { type, args }: { type: PopupWindowTypes; args: CreateSendTx }) => {
      console.log('init-window-type', type);
      this.type = type;

      switch (this.type) {
        case 'sendTx':
          this.implVM = new SendTxVM(args);
          this.history.push('/sendTx');
          break;
      }
    });
  }

  implVM: SendTxVM;
}

export default new ApplicationPopup();
