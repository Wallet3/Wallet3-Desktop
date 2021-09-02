import './index.css';
import './i18n';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App, { Application } from './ui/viewmodels/Application';
import currencyVM, { CurrencyVM } from './ui/viewmodels/settings/CurrencyVM';
import langsVM, { LangsVM } from './ui/viewmodels/settings/LangsVM';
import mnVM, { MnemonicVM } from './ui/viewmodels/MnemonicVM';
import networksVM, { NetworksVM } from './ui/viewmodels/NetworksVM';

import AppPage from './ui/App';
import { observer } from 'mobx-react-lite';

// import swapVM, { SwapVM } from './ui/viewmodels/SwapVM';


export interface ViewModels {
  app: Application;
  mnVM: MnemonicVM;
  networksVM: NetworksVM;
  langsVM: LangsVM;
  currencyVM: CurrencyVM;
  // swapVM?: SwapVM;
}

const viewmodels = { app: App, mnVM, networksVM, langsVM, currencyVM };
const AppView = observer((args: ViewModels) => <AppPage {...args} />);

function render() {
  ReactDOM.render(<AppView {...viewmodels} />, document.getElementById('root'), () => App.init());
}

render();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') return;
  App.connectWallet();
});
