import * as crypto from 'crypto';

import { BrowserWindow, DesktopCapturerSource, IpcRendererEvent, SourcesOptions, desktopCapturer } from 'electron';
import { clipboard, contextBridge, ipcRenderer, shell, webFrame } from 'electron';
import { decrypt, encrypt } from './common/Cipher';

import Messages from './common/Messages';

webFrame.setVisualZoomLevelLimits(1, 1);

const windowId = crypto.randomBytes(4).toString('hex');
let ipcSecureKey: Buffer;

async function initSecureContext() {
  const ecdh = crypto.createECDH('secp521r1');
  const rendererEcdhKey = ecdh.generateKeys();

  const mainKey = await ipcRenderer.invoke(Messages.exchangeDHKey, {
    rendererEcdhKey,
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
    const encrypted = encrypt(serialized, ipcSecureKey);
    const [iv, returned] = await ipcRenderer.invoke(`${channel}-secure`, encrypted, windowId);

    return returned ? (JSON.parse(decrypt(iv, returned, ipcSecureKey)) as T) : undefined;
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

  show = async (title: string, args: NotificationOptions) => {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const notification = new Notification(title, args);

    if ((args.data as string)?.startsWith('https')) {
      notification.onclick = () => shell.openExternal(args.data);
    }
  };
}

contextBridge.exposeInMainWorld(NotificationApi.API_KEY, new NotificationApi());

export class WindowApi {
  static readonly API_KEY = 'wallet3_window';

  maximize = () => {
    const currentWindow = require('@electron/remote').getCurrentWindow() as BrowserWindow;

    if (currentWindow.isMaximized()) {
      currentWindow.unmaximize();
    } else {
      currentWindow.maximize();
    }
  };

  minimize = () => {
    require('@electron/remote').getCurrentWindow().minimize();
  };
}

contextBridge.exposeInMainWorld(WindowApi.API_KEY, new WindowApi());
