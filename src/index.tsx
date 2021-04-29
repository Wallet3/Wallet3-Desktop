import './index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App, { Application } from './ui/viewmodels/Application';
import mnVM, { MnemonicVM } from './ui/viewmodels/MnemonicVM';

import AppPage from './ui/App';
import { observer } from 'mobx-react-lite';

const AppView = observer((args: { app: Application; mnVm: MnemonicVM }) => <AppPage {...args} />);

function render() {
  ReactDOM.render(<AppView app={App} mnVm={mnVM} />, document.getElementById('root'), () => App.init());
}

render();
