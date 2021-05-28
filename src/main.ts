import { BrowserWindow, Menu, TouchBar, TouchBarButton, Tray, app, nativeImage, powerMonitor } from 'electron';

import App from './backend/App';
import Coingecko from './api/Coingecko';
import DBMan from './backend/DBMan';
import GasnowWs from './gas/Gasnow';
import KeyMan from './backend/KeyMan';
import Messages from './common/Messages';
import TxMan from './backend/TxMan';
import WCMan from './backend/WCMan';
import { autorun } from 'mobx';
import delay from 'delay';
import { globalShortcut } from 'electron';
import i18n from './i18n';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createTouchBar = (mainWindow: BrowserWindow) => {
  const newTouchBar = ({
    walletConnect,
    gas,
    price,
  }: {
    walletConnect: TouchBarButton;
    gas: TouchBarButton;
    price?: TouchBarButton;
  }) => {
    const touchbar = new TouchBar({ items: [walletConnect, price, gas, new TouchBar.TouchBarSpacer({ size: 'flexible' })] });
    mainWindow.setTouchBar(touchbar);
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

let tray: Tray;
const createTray = async () => {
  if (tray) return;

  tray = new Tray(nativeImage.createFromDataURL(require('./assets/icons/app/tray.png').default));
  const menu = Menu.buildFromTemplate([
    {
      label: i18n.t('Connect DApp'),
      accelerator: 'CommandOrControl+D',
      click: () => {
        if (!App.ready) return;
        App.createPopupWindow('scanQR', {});
      },
    },
    { label: i18n.t('Show Wallet 3'), click: () => createWindow(), accelerator: 'CommandOrControl+S' },
    { type: 'separator' },
    { label: i18n.t('Quit'), click: () => app.quit(), accelerator: 'CommandOrControl+Q' },
  ]);

  tray.setContextMenu(menu);
};

const createWindow = async (): Promise<void> => {
  if (App.mainWindow) {
    App.mainWindow.show();
    App.mainWindow.focus();
    return;
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 540,
    width: 360,
    minWidth: 360,
    minHeight: 540,
    frame: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      enableRemoteModule: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  App.mainWindow = mainWindow;

  // mainWindow.once('ready-to-show', () => {
  //   mainWindow.webContents.send(Messages.pendingTxsChanged, [...TxMan.pendingTxs]);
  //   mainWindow.webContents.send(Messages.wcConnectsChanged, WCMan.connectedSessions);
  // });

  mainWindow.once('closed', () => {
    app.dock.hide();
    App.mainWindow = undefined;
  });

  createTouchBar(mainWindow);
  createTray();
  app.dock.show();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  await DBMan.init();
  await Promise.all([KeyMan.init(), TxMan.init(), WCMan.init()]);

  App.init();
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

  globalShortcut.register('CommandOrControl+C+D', () => {
    if (!App.ready) return;
    App.createPopupWindow('scanQR', {});
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let idleTimer: NodeJS.Timeout;

app.on('browser-window-focus', () => {
  clearTimeout(idleTimer);
});

app.on('browser-window-blur', () => {
  idleTimer = setTimeout(() => {
    App.mainWindow?.webContents.send(Messages.idleExpired, { idleExpired: true });
  }, 5 * 1000 * 60);
});

powerMonitor.on('resume', () => {
  setTimeout(async () => {
    await WCMan.dispose();
    WCMan.init();
  }, 3000);

  GasnowWs.restart(true);
});

powerMonitor.on('suspend', () => {
  App.mainWindow?.webContents.send(Messages.idleExpired, { idleExpired: true });
});
