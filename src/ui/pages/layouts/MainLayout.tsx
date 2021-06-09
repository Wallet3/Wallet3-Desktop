import './MainLayout.css';

import { Link, useLocation, useRouteMatch } from 'react-router-dom';
import { Route, Switch } from 'react-router';
import { Settings, Wallet } from '../app';

import { Application } from '../../viewmodels/Application';
import { CurrencyVM } from '../../viewmodels/settings/CurrencyVM';
import Feather from 'feather-icons-react';
import { LangsVM } from '../../viewmodels/settings/LangsVM';
import { NetworksVM } from '../../viewmodels/NetworksVM';
import React from 'react';
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
  const { pathname } = useLocation();

  let activeTab = 0;
  if (pathname.endsWith('settings')) activeTab = 1;

  return (
    <SkeletonTheme color="#eeeeee90" highlightColor="#f5f5f5d0">
      <div className="layout">
        <div className="ui">
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
          <Link to={`${url}`}>
            <div className={activeTab === 0 ? 'active' : ''}>
              <Feather icon="credit-card" size={20} />
              <span>Wallet</span>
            </div>
          </Link>

          <Link to={`${url}/settings`}>
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
