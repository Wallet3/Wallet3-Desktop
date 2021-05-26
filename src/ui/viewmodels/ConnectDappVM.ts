import { WcMessages } from '../../common/Messages';
import ipc from '../bridges/IPC';
import { makeAutoObservable } from 'mobx';

type Params = {
  peerId: string;
  peerMeta: WCClientMeta;
  chainId?: number | null;
};

export class ConnectDappVM {
  chainId = 0;
  icon = '';
  appName = '';
  url = '';
  desc = '';
  peerId = '';

  constructor(params: Params[]) {
    makeAutoObservable(this);

    const [param] = params;
    this.peerId = param.peerId;
    this.chainId = param.chainId || 0;
    this.appName = param.peerMeta.name;
    this.icon = param.peerMeta.icons[0];
    this.url = param.peerMeta.url;
    this.desc = param.peerMeta.description;

    console.log(param);
  }

  setChainId(id: number) {
    this.chainId = id;
  }

  approve() {
    ipc.invoke(WcMessages.approveWcSession(this.peerId), { userChainId: this.chainId });
  }

  reject() {
    ipc.invoke(WcMessages.rejectWcSession(this.peerId));
  }
}
