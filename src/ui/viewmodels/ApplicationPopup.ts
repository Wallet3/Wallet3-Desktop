import Messages, { CreateSendTx, PopupWindowTypes } from '../../common/Messages';

import { ConfirmVM } from './ConfirmVM';
import { createBrowserHistory } from 'history';
import ipc from '../ipc/Bridge';

export class ApplicationPopup {
  readonly history = createBrowserHistory();
  type: PopupWindowTypes;

  init() {
    ipc.once(Messages.initWindowType, (e, { type, args }: { type: PopupWindowTypes; args: CreateSendTx }) => {
      this.type = type;

      switch (this.type) {
        case 'sendTx':
          this.implVM = new ConfirmVM(args);
          this.history.push('/sendTx');
          break;
      }
    });
  }

  implVM: ConfirmVM;
}

export default new ApplicationPopup();
