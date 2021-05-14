import { BrowserWindow, Menu, TouchBar, TouchBarButton, Tray, app, nativeImage } from 'electron';
import { autorun, reaction } from 'mobx';

import App from './backend/App';
import Coingecko from './api/Coingecko';
import GasnowWs from './api/Gasnow';
import Messages from './common/Messages';
import TxMan from './backend/TxMan';

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
    click: () => {
      if (App.addresses.length === 0) return;
      App.createPopupWindow('scanQR', {});
    },
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
  const menu = Menu.buildFromTemplate([{ label: 'Wallet Connect' }]);
  tray.setContextMenu(menu);
};

const createWindow = async (): Promise<void> => {
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
      enableRemoteModule: true,
    },
    // transparent: true,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  App.mainWindow = mainWindow;

  createTouchBar(mainWindow);
  createTray();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  createWindow();

  App.init();
  TxMan.init();

  autorun(() => {
    App.mainWindow?.webContents.send(Messages.pendingTxsChanged, JSON.stringify(TxMan.pendingTxs));
  });

  GasnowWs.start(true);
  GasnowWs.onClose = () => GasnowWs.start(true);
  reaction(
    () => GasnowWs.fast,
    () => {
      const { gas } = App.touchBarButtons || {};
      if (!gas) return;

      gas.label = `${GasnowWs.rapidGwei} | ${GasnowWs.fastGwei} | ${GasnowWs.standardGwei}`;
      tray?.setTitle(gas.label);
    }
  );

  Coingecko.start();
  reaction(
    () => Coingecko.eth,
    () => {
      const { price } = App.touchBarButtons || {};
      if (!price) return;

      price.label = `$ ${Coingecko.eth}`;
    }
  );
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
