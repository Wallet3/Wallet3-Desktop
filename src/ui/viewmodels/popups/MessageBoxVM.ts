import Messages from '../../../common/Messages';
import ipc from '../../bridges/IPC';

export class MessageBoxVM {
  icon?: string;
  title?: string;
  message?: string;
  reqid: string;

  constructor(payload: { icon: string; title: string; message: string; reqid: string }) {
    this.icon = payload.icon;
    this.title = payload.title;
    this.message = payload.message;
    this.reqid = payload.reqid;
  }

  approve() {
    ipc.invokeSecure(Messages.returnMsgBoxResult(this.reqid), { approved: true });
  }

  reject() {
    ipc.invokeSecure(Messages.returnMsgBoxResult(this.reqid), { approved: false });
  }
}
