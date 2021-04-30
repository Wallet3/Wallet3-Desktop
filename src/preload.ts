import * as crypto from 'crypto';

import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron';
import { decrypt, encrypt } from './common/Cipher';

import IPCKeys from './common/Messages';

const ipcSecureIv = crypto.randomBytes(16);
let ipcSecureKey: Buffer;

async function initSecureContext() {
  const ecdh = crypto.createECDH('secp521r1');
  const rendererEcdhKey = ecdh.generateKeys();

  const mainKey = await ipcRenderer.invoke(IPCKeys.exchangeDHKey, {
    rendererEcdhKey,
    ipcSecureIv,
  });

  ipcSecureKey = ecdh.computeSecret(mainKey);
}

export class ContextBridgeApi {
  static readonly API_KEY = 'wallet3_ipc';

  invoke = (channel: string, argObj: any) => {
    return ipcRenderer.invoke(channel, argObj);
  };

  invokeSecure = async (channel: string, argObj: any) => {
    const serialized = JSON.stringify(argObj);
    const encrypted = encrypt(ipcSecureIv, serialized, ipcSecureKey);
    const returned = await ipcRenderer.invoke(`${channel}-secure`, encrypted);
    const ret = JSON.parse(decrypt(ipcSecureIv, returned, ipcSecureKey));

    return ret;
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

initSecureContext();
