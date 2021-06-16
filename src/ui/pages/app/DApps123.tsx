import './DApps123.css';

import { Application } from '../../viewmodels/Application';
import { NetworksVM } from '../../viewmodels/NetworksVM';
import React from 'react';
import UtilityBar from './components/UtilityBar';
import { WalletVM } from '../../viewmodels/WalletVM';
import { observer } from 'mobx-react-lite';

interface IConstructor {
  app: Application;
  networksVM: NetworksVM;
  walletVM: WalletVM;
}

export default observer(({ app, networksVM, walletVM }: IConstructor) => {
  return (
    <div className="page dapps123">
      <UtilityBar app={app} networksVM={networksVM} walletVM={walletVM} />
    </div>
  );
});
