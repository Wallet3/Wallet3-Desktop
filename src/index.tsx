import './index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App, { Application } from './ui/viewmodels/Application';
import mnVM, { MnemonicVM } from './ui/viewmodels/MnemonicVM';
import networksVM, { NetworksVM } from './ui/viewmodels/NetworksVM';
import walletVM, { WalletVM } from './ui/viewmodels/WalletVM';

import AppPage from './ui/App';
import Coingecko from './api/Coingecko';
import { observer } from 'mobx-react-lite';

interface ViewModels {
  app: Application;
  mnVM: MnemonicVM;
  networksVM: NetworksVM;
  walletVM: WalletVM;
}

const viewmodels = { app: App, mnVM, networksVM, walletVM };
const AppView = observer((args: ViewModels) => <AppPage {...args} />);

function render() {
  ReactDOM.render(<AppView {...viewmodels} />, document.getElementById('root'), () => App.init());
}

render();
