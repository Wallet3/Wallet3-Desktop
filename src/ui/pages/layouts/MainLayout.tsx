import './MainLayout.css';

import { Link, useRouteMatch } from 'react-router-dom';
import React, { useState } from 'react';
import { Route, Switch } from 'react-router';
import { Settings, Wallet } from '../app';

import Feather from 'feather-icons-react';
import { NetworksVM } from '../../viewmodels/NetworksVM';
import { SkeletonTheme } from 'react-loading-skeleton';
import { WalletVM } from '../../viewmodels/WalletVM';
import { observer } from 'mobx-react-lite';

export default observer((args: { networksVM: NetworksVM; walletVM: WalletVM }) => {
  let { path, url } = useRouteMatch();

  const [activeTab, setActiveTab] = useState(0);
  const { walletVM } = args;

  return (
    <SkeletonTheme color="#eeeeee90" highlightColor="#f5f5f5d0">
      <div className="layout">
        <div>
          <Switch>
            <Route path={`${path}/settings`} component={Settings} />
            <Route path={path}>
              <Wallet {...args} accountVM={walletVM.currentAccount} />
            </Route>
          </Switch>
        </div>

        <div className="tabs">
          <Link to={`${url}`} onClick={() => setActiveTab(0)}>
            <div className={activeTab === 0 ? 'active' : ''}>
              <Feather icon="credit-card" size={20} />
              <span>Wallet</span>
            </div>
          </Link>

          <Link to={`${url}/settings`} onClick={() => setActiveTab(1)}>
            <div className={activeTab === 1 ? 'active' : ''}>
              <Feather icon="settings" size={20} />
              <span>Settings</span>
            </div>
          </Link>
        </div>
      </div>
    </SkeletonTheme>
  );
});
