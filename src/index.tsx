import './index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App, { Application } from './ui/viewmodels/Application';

import AppPage from './ui/App';
import { observer } from 'mobx-react-lite';

const AppView = observer((args: { app: Application }) => <AppPage {...args} />);

function render() {
  ReactDOM.render(<AppView app={App} />, document.getElementById('root'), () => App.init());
}

render();
