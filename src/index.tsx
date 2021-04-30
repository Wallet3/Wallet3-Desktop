import './index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App, { Application } from './ui/viewmodels/Application';
import mnVM, { MnemonicVM } from './ui/viewmodels/MnemonicVM';
import networksVM, { NetworksVM } from './ui/viewmodels/NetworksVM';

import AppPage from './ui/App';
import { observer } from 'mobx-react-lite';

interface ViewModels {
  app: Application;
  mnVM: MnemonicVM;
  networksVM: NetworksVM;
}

const AppView = observer((args: ViewModels) => <AppPage {...args} />);

function render() {
  ReactDOM.render(<AppView app={App} mnVM={mnVM} networksVM={networksVM} />, document.getElementById('root'), () =>
    App.init()
  );
}

render();
