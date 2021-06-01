import './index.css';
import './i18n';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App, { Application } from './ui/viewmodels/Application';
import currencyVM, { CurrencyVM } from './ui/viewmodels/settings/CurrencyVM';
import langsVM, { LangsVM } from './ui/viewmodels/settings/LangsVM';
import mnVM, { MnemonicVM } from './ui/viewmodels/MnemonicVM';
import networksVM, { NetworksVM } from './ui/viewmodels/NetworksVM';
import walletVM, { WalletVM } from './ui/viewmodels/WalletVM';

import AppPage from './ui/App';
import clipboard from './ui/bridges/Clipboard';
import { observer } from 'mobx-react-lite';

interface ViewModels {
  app: Application;
  mnVM: MnemonicVM;
  networksVM: NetworksVM;
  walletVM: WalletVM;
  currencyVM: CurrencyVM;
  langsVM: LangsVM;
}

const viewmodels = { app: App, mnVM, networksVM, walletVM, currencyVM, langsVM };
const AppView = observer((args: ViewModels) => <AppPage {...args} />);

function render() {
  ReactDOM.render(<AppView {...viewmodels} />, document.getElementById('root'), () => App.init());
}

render();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') return;
  const text = clipboard.readText();

  if (text.startsWith('wc:') && text.includes('bridge=')) {
    App.connectWallet(text);
  }
});
