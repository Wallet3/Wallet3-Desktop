import * as crypto from 'crypto';

import { DesktopCapturerSource, IpcRendererEvent, SourcesOptions, desktopCapturer } from 'electron';
import { NotificationConstructorOptions, clipboard, contextBridge, ipcRenderer, shell, webFrame } from 'electron';
import { decrypt, encrypt } from './common/Cipher';

import Messages from './common/Messages';

webFrame.setVisualZoomLevelLimits(1, 1);

const windowId = crypto.randomBytes(4).toString('hex');
let ipcSecureIv: Buffer;
let ipcSecureKey: Buffer;

async function initSecureContext() {
  const ecdh = crypto.createECDH('secp521r1');
  const rendererEcdhKey = ecdh.generateKeys();

  const mainKey = await ipcRenderer.invoke(Messages.exchangeDHKey, {
    rendererEcdhKey,
    windowId,
  });

  ipcSecureKey = ecdh.computeSecret(mainKey);
  ipcSecureIv = crypto.createHash('sha256').update(ipcSecureKey).digest().subarray(0, 16);
}

initSecureContext();

export class IpcBridgeApi {
  static readonly API_KEY = 'wallet3_ipc';

  invoke = (channel: string, argObj: any) => {
    return ipcRenderer.invoke(channel, argObj);
  };

  invokeSecure = async <T>(channel: string, argObj: any = {}) => {
    argObj['__obfs'] = crypto.randomBytes(3).toString('hex');

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

  readText = (type?: 'selection' | 'clipboard') => {
    return clipboard.readText(type);
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

export class NotificationApi {
  static readonly API_KEY = 'wallet3_notification';

  show = (args: NotificationConstructorOptions) => {
    ipcRenderer.invoke(Messages.sendLocalNotification, args);
  };
}

contextBridge.exposeInMainWorld(NotificationApi.API_KEY, new NotificationApi());
