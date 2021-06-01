import { WcMessages } from '../../../common/Messages';
import ipc from '../../bridges/IPC';
import { makeAutoObservable } from 'mobx';

type Params = {
  peerId: string;
  peerMeta: WCClientMeta;
  chainId?: number | null;
};

export class ConnectDappVM {
  userChainId = 0;
  icon = '';
  appName = '';
  url = '';
  desc = '';
  peerId = '';

  constructor(params: Params[]) {
    makeAutoObservable(this);

    const [param] = params;
    this.peerId = param.peerId;
    this.userChainId = param.chainId || 0;
    this.appName = param.peerMeta.name;
    this.icon = param.peerMeta.icons[0] || '';
    this.url = param.peerMeta.url;
    this.desc = param.peerMeta.description;
  }

  setChainId(id: number) {
    this.userChainId = id;
  }

  approve() {
    ipc.invoke(WcMessages.approveWcSession(this.peerId), { userChainId: this.userChainId });
  }

  reject() {
    ipc.invoke(WcMessages.rejectWcSession(this.peerId));
  }
}
