import * as crypto from 'crypto';

import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron';

export class ContextBridgeApi {
  static readonly API_KEY = 'wallet3_ipc';

  invoke = (channel: string, ...args: any[]) => {
    return ipcRenderer.invoke(channel, ...args);
  };

  on = (channel: string, listener: (event: IpcRendererEvent, ...arg: any[]) => void) => {
    ipcRenderer.on(channel, listener);
  };
}

contextBridge.exposeInMainWorld(ContextBridgeApi.API_KEY, new ContextBridgeApi());

export class CryptoApi {
  static readonly API_KEY = 'wallet3_crypto';

  sha256 = (content: string) => {
    return crypto.createHash('sha256').update(content).digest().toString('hex');
  };
}

contextBridge.exposeInMainWorld(CryptoApi.API_KEY, new CryptoApi());
