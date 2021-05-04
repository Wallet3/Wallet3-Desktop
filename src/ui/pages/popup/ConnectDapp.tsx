import './ConnectDapp.css';

import { ApplicationPopup } from '../../viewmodels/ApplicationPopup';
import { ConnectDappVM } from '../../viewmodels/ConnectDappVM';
import { PopupTitle } from '../../components';
import React from 'react';
import { observer } from 'mobx-react-lite';

export default observer(({ app }: { app: ApplicationPopup }) => {
  const { connectDappVM: vm } = app;

  return (
    <div className="page connectdapp">
      <PopupTitle title="Connect" icon="anchor" />

      <div className="content">
        <img src={vm.icon} alt={vm.appName} />
        <div>{vm.appName}</div>
        <div>{vm.desc}</div>
        <div>{vm.url}</div>
      </div>

      <div className="actions">
        <button>Reject</button>
        <button className="positive">Approve</button>
      </div>
    </div>
  );
});
