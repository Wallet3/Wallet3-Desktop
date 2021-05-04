import './index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import PopupApp, { ApplicationPopup } from './ui/viewmodels/ApplicationPopup';

import AppPage from './ui/Popup';
import Messages from './common/Messages';
import ipc from './ui/bridges/IPC';
import { observer } from 'mobx-react-lite';

interface ViewModels {
  app: ApplicationPopup;
}

const viewmodels = { app: PopupApp };
const PopupView = observer((args: ViewModels) => <AppPage {...args} />);

function render() {
  ReactDOM.render(<PopupView {...viewmodels} />, document.getElementById('root'), () => PopupApp.init());
}

render();

window.onclose = () => ipc.invokeSecure(Messages.releaseWindow, {});
