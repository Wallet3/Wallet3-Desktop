import './MainLayout.css';

import { Link, useRouteMatch } from 'react-router-dom';
import React, { useState } from 'react';
import { Route, Switch } from 'react-router';
import { Settings, Wallet } from '../app';

import { Application } from '../../viewmodels/Application';
import { CurrencyVM } from '../../viewmodels/CurrencyVM';
import Feather from 'feather-icons-react';
import { LangsVM } from '../../viewmodels/LangsVM';
import { NetworksVM } from '../../viewmodels/NetworksVM';
import { SkeletonTheme } from 'react-loading-skeleton';
import { WalletVM } from '../../viewmodels/WalletVM';
import { observer } from 'mobx-react-lite';

interface Props {
  networksVM: NetworksVM;
  walletVM: WalletVM;
  app: Application;
  currencyVM: CurrencyVM;
  langsVM: LangsVM;
}

export default observer((args: Props) => {
  const { path, url } = useRouteMatch();

  let tab = 0;
  if (location.pathname.endsWith('settings')) {
    tab = 1;
  }

  const [activeTab, setActiveTab] = useState(tab);

  return (
    <SkeletonTheme color="#eeeeee90" highlightColor="#f5f5f5d0">
      <div className="layout">
        <div>
          <Switch>
            <Route path={`${path}/settings`}>
              <Settings {...args} />
            </Route>

            <Route path={path}>
              <Wallet {...args} />
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
