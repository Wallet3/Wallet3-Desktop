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
        <div className="desc" title={vm.desc}>
          {vm.desc}
        </div>
        <div>{vm.url}</div>
      </div>

      <div className="actions">
        <button
          onClick={(_) => {
            vm.reject();
            window.close();
          }}
        >
          Reject
        </button>
        <button
          className="positive"
          onClick={(_) => {
            vm.approve();
            window.close();
          }}
        >
          Approve
        </button>
      </div>
    </div>
  );
});
