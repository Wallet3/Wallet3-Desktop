import './backend/AppMenu';
import './backend/CryptoRandom';

import { BrowserWindow, Menu, TouchBar, TouchBarButton, Tray, app, nativeImage, powerMonitor, protocol } from 'electron';
import { DBMan, KeyMan, TxMan } from './backend/mans';
import { handleDeepLink, supportedSchemes } from './backend/DeepLinkHandler';

import App from './backend/App';
import Coingecko from './api/Coingecko';
import GasnowWs from './gas/Gasnow';
import Messages from './common/Messages';
import { autorun } from 'mobx';
import delay from 'delay';
import { globalShortcut } from 'electron';
import i18n from './i18n';
import isOnline from 'is-online';
import { resolve } from 'path';
import { updateApp } from './backend/Updater';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let tray: Tray;
let idleTimer: NodeJS.Timeout;

const prod = app.isPackaged;
const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
if (!isMac) require('@electron/remote/main').initialize();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createTouchBar = (mainWindow: BrowserWindow) => {
  if (!isMac) return;

  const newTouchBar = ({
    walletConnect,
    gas,
    price,
  }: {
    walletConnect: TouchBarButton;
    gas: TouchBarButton;
    price?: TouchBarButton;
  }) => {
    const touchBar = new TouchBar({ items: [walletConnect, price, gas, new TouchBar.TouchBarSpacer({ size: 'flexible' })] });
    mainWindow.setTouchBar(touchBar);
  };

  if (App.touchBarButtons) {
    newTouchBar(App.touchBarButtons);
    return;
  }

  const walletConnect = new TouchBar.TouchBarButton({
    label: 'WalletConnect',
    iconPosition: 'left',
    enabled: false,
    icon: nativeImage.createFromDataURL(require('./assets/icons/touchbar/scan.png').default),
    click: () => App.createPopupWindow('scanQR', {}),
  });

  const price = new TouchBar.TouchBarButton({
    label: '...',
    iconPosition: 'left',
    icon: nativeImage.createFromDataURL(require('./assets/icons/touchbar/eth.png').default),
  });

  const gas = new TouchBar.TouchBarButton({
    label: '...',
    iconPosition: 'left',
    icon: nativeImage.createFromDataURL(require('./assets/icons/touchbar/gas-station.png').default),
  });

  App.touchBarButtons = { walletConnect, gas, price };
  newTouchBar(App.touchBarButtons);
};

const createTray = async () => {
  if (tray) return;

  const trayImage = nativeImage.createEmpty();
  trayImage.addRepresentation({
    scaleFactor: 3,
    width: 20,
    height: 20,
    dataURL: require(`./assets/icons/app/tray_${process.platform}.png`).default,
  });
  trayImage.isMacTemplateImage = true;

  tray = new Tray(trayImage);
  const menu = Menu.buildFromTemplate([
    {
      label: i18n.t('WalletConnect'),
      accelerator: 'CommandOrControl+D',
      click: () => {
        if (!App.ready) return;
        App.createPopupWindow('scanQR', {});
      },
    },
    { label: i18n.t('Show Wallet 3'), click: () => createWindow(), accelerator: 'CommandOrControl+3' },
    { type: 'separator' },
    { label: i18n.t('Quit'), click: () => app.quit(), accelerator: 'CommandOrControl+Q' },
  ]);

  tray.setContextMenu(menu);

  if (isWin) tray.on('double-click', () => createWindow());
};

const createWindow = async (): Promise<void> => {
  if (App.mainWindow) {
    App.mainWindow.show();
    App.mainWindow.focus();
    return;
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 545,
    width: isMac ? 365 : 375,
    minWidth: isMac ? 365 : 375,
    minHeight: 545,
    frame: false,
    titleBarStyle: isMac ? 'hiddenInset' : 'hidden',
    acceptFirstMouse: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      enableRemoteModule: isMac ? false : true,
      devTools: !prod,
    },
  });

  App.mainWindow = mainWindow;
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY, {});

  mainWindow.once('closed', () => {
    mainWindow.removeAllListeners();
    if (isMac) app.dock.hide();
    App.mainWindow = undefined;
  });

  createTouchBar(mainWindow);
  createTray();
  if (isMac) app.dock.show();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  await DBMan.init();
  await Promise.all([KeyMan.init(), TxMan.init()]);

  await App.init();
  createWindow();

  GasnowWs.start(true);
  GasnowWs.onclose = () => GasnowWs.start(true);
  autorun(() => {
    const { gas } = App.touchBarButtons || {};
    if (!gas) return;

    gas.label = `${GasnowWs.rapidGwei} | ${GasnowWs.fastGwei} | ${GasnowWs.standardGwei}`;
    tray?.setTitle(gas.label);
  });

  Coingecko.start();
  autorun(() => {
    const { price } = App.touchBarButtons || {};
    if (!price) return;

    price.label = `$ ${Coingecko.eth}`;
  });

  autorun(() => {
    const { walletConnect } = App.touchBarButtons || {};
    if (!walletConnect) return;

    walletConnect.enabled = App.ready;
  });

  const scanQR = () => {
    if (!App.ready) return;
    App.createPopupWindow('scanQR', {});
  };

  globalShortcut.register('CommandOrControl+Option+S', scanQR);
  globalShortcut.register('CommandOrControl+Alt+S', scanQR);

  globalShortcut.register('CommandOrControl+Option+3', () => createWindow());
  globalShortcut.register('CommandOrControl+Alt+3', () => createWindow());

  if (process.platform === 'win32') {
    // Set the path of electron.exe and your app.
    // These two additional parameters are only available on windows.
    // Setting this is required to get this working in dev mode.
    supportedSchemes.forEach((s) => app.setAsDefaultProtocolClient(s, process.execPath, [resolve(process.argv[1])]));
  } else {
    supportedSchemes.forEach((s) => app.setAsDefaultProtocolClient(s));
  }

  if (isWin) {
    app.setAppUserModelId('jp.co.chainbow.wallet3');
  }

  if (isMac) app.setSecureKeyboardEntryEnabled(true);

  updateApp();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('browser-window-focus', () => {
  clearTimeout(idleTimer);
});

app.on('browser-window-blur', () => {
  idleTimer = setTimeout(() => App.mainWindow?.webContents.send(Messages.idleExpired, { idleExpired: true }), 5 * 1000 * 60);
});

app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    event.preventDefault();
  });
});

powerMonitor.on('resume', async () => {
  let attempts = 0;

  while (!(await isOnline({ timeout: 5000 }))) {
    await delay(100);
    attempts++;

    if (attempts > 10) {
      return;
    }
  }

  GasnowWs.restart(true);
  KeyMan.keys.forEach(async (k) => {
    const { wcman } = KeyMan.connections.get(k.id) || {};
    await wcman?.init();
  });
});

powerMonitor.on('suspend', () => {
  KeyMan.keys.map(async (k) => {
    const { wcman } = KeyMan.connections.get(k.id) || {};
    await wcman?.dispose();
  });
});

powerMonitor.on('suspend', () => {
  App.mainWindow?.webContents.send(Messages.idleExpired, { idleExpired: true });
});

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', (event, argv, workingDirectory) => {
    if (process.platform !== 'darwin') {
      // Find the arg that is our custom protocol url and store it
      const deeplinkUrl = argv.find((arg) => supportedSchemes.some((s) => arg?.startsWith(s)));
      handleDeepLink(deeplinkUrl);
    }

    if (App.mainWindow?.isMinimized()) App.mainWindow?.restore();
    App.mainWindow?.focus();
  });
}

app.on('open-url', function (event, url) {
  event.preventDefault();
  handleDeepLink(url);
});

process.on('uncaughtException', (e) => console.error(e));
