import * as crypto from 'crypto';

import {
  DesktopCapturerSource,
  IpcRendererEvent,
  SourcesOptions,
  clipboard,
  contextBridge,
  desktopCapturer,
  ipcRenderer,
  shell,
} from 'electron';
import { decrypt, encrypt } from './common/Cipher';

import IPCKeys from './common/Messages';
import Messages from './common/Messages';

const ipcSecureIv = crypto.randomBytes(16);
const windowId = crypto.randomBytes(4).toString('hex');
let ipcSecureKey: Buffer;

async function initSecureContext() {
  const ecdh = crypto.createECDH('secp521r1');
  const rendererEcdhKey = ecdh.generateKeys();

  const mainKey = await ipcRenderer.invoke(IPCKeys.exchangeDHKey, {
    rendererEcdhKey,
    ipcSecureIv,
    windowId,
  });

  ipcSecureKey = ecdh.computeSecret(mainKey);
}

initSecureContext();

export class IpcBridgeApi {
  static readonly API_KEY = 'wallet3_ipc';

  invoke = (channel: string, argObj: any) => {
    return ipcRenderer.invoke(channel, argObj);
  };

  invokeSecure = async <T>(channel: string, argObj: any = {}) => {
    const serialized = JSON.stringify(argObj);
    const encrypted = encrypt(ipcSecureIv, serialized, ipcSecureKey);
    const returned = await ipcRenderer.invoke(`${channel}-secure`, encrypted, windowId);

    return returned ? (JSON.parse(decrypt(ipcSecureIv, returned, ipcSecureKey)) as T) : undefined;
  };

  on = (channel: string, listener: (event: IpcRendererEvent, ...arg: any[]) => void) => {
    ipcRenderer.on(channel, listener);
  };

  once = (channel: string, listener: (event: IpcRendererEvent, ...arg: any[]) => void) => {
    ipcRenderer.once(channel, listener);
  };
}

contextBridge.exposeInMainWorld(IpcBridgeApi.API_KEY, new IpcBridgeApi());

export class CryptoApi {
  static readonly API_KEY = 'wallet3_crypto';

  sha256 = (content: string) => {
    return crypto.createHash('sha256').update(content).digest().toString('hex');
  };
}

contextBridge.exposeInMainWorld(CryptoApi.API_KEY, new CryptoApi());

export class DesktopCapturerApi {
  static readonly API_KEY = 'wallet3_capturer';

  getSources = (options: SourcesOptions): Promise<DesktopCapturerSource[]> => {
    return desktopCapturer.getSources(options);
  };
}

contextBridge.exposeInMainWorld(DesktopCapturerApi.API_KEY, new DesktopCapturerApi());

export class ClipboardApi {
  static readonly API_KEY = 'wallet3_clipboard';

  writeText = (text: string) => {
    clipboard.writeText(text);
  };
}

contextBridge.exposeInMainWorld(ClipboardApi.API_KEY, new ClipboardApi());

export class ShellApi {
  static readonly API_KEY = 'wallet3_shell';

  open = (url: string) => {
    shell.openExternal(url);
  };
}

contextBridge.exposeInMainWorld(ShellApi.API_KEY, new ShellApi());
