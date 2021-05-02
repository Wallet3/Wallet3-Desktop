import Messages, { PopupWindowTypes } from '../../common/Messages';

import { createBrowserHistory } from 'history';
import ipc from '../ipc/Bridge';

export class ApplicationPopup {
  readonly history = createBrowserHistory();
  type: PopupWindowTypes;

  init() {
    ipc.once(Messages.initWindowType, (e, { type }: { type: PopupWindowTypes }) => {
      console.log('init-window-type', type);
      this.type = type;

      switch (this.type) {
        case 'sendTx':
          this.history.push('/sendTx');
          break;
      }
    });
  }
}

export default new ApplicationPopup();
