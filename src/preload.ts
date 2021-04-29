import * as crypto from 'crypto';

import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron';
import { decrypt, encrypt } from './common/Cipher';

import IPCKeys from './common/IPC';

const ipcSecureIv = crypto.randomBytes(16);
let ipcSecureKey: string;

async function initSecureContext() {
  const rendererDH = crypto.createDiffieHellman(256);
  const rendererKey = rendererDH.generateKeys();
  const rendererPrime = rendererDH.getPrime();
  const rendererGenerator = rendererDH.getGenerator();

  console.log(rendererKey);
  console.log(rendererPrime);
  console.log(rendererGenerator);

  const mainKey = await ipcRenderer.invoke(IPCKeys.exchangeDHKey, {
    rendererKey,
    rendererPrime,
    rendererGenerator,
    ipcSecureIv,
  });

  ipcSecureKey = rendererDH.computeSecret(mainKey).toString('hex');
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
    return JSON.parse(decrypt(ipcSecureIv, returned, ipcSecureKey));
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
