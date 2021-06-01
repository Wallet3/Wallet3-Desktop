import './MainLayout.css';

import { Link, useRouteMatch } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Route, Switch } from 'react-router';
import { Settings, Wallet } from '../app';

import { Application } from '../../viewmodels/Application';
import { CurrencyVM } from '../../viewmodels/settings/CurrencyVM';
import Feather from 'feather-icons-react';
import { LangsVM } from '../../viewmodels/settings/LangsVM';
import { NetworksVM } from '../../viewmodels/NetworksVM';
import { SkeletonTheme } from 'react-loading-skeleton';
import { WalletVM } from '../../viewmodels/WalletVM';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';

interface Props {
  networksVM: NetworksVM;
  walletVM: WalletVM;
  app: Application;
  currencyVM: CurrencyVM;
  langsVM: LangsVM;
}

class LayoutStatus {
  activeTab = 0;

  constructor() {
    makeAutoObservable(this);
  }

  setActiveTab(index: number) {
    this.activeTab = index;
  }
}

const layoutStatus = new LayoutStatus();

export default observer((args: Props) => {
  const { path, url } = useRouteMatch();

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
          <Link to={`${url}`} onClick={() => layoutStatus.setActiveTab(0)}>
            <div className={layoutStatus.activeTab === 0 ? 'active' : ''}>
              <Feather icon="credit-card" size={20} />
              <span>Wallet</span>
            </div>
          </Link>

          <Link to={`${url}/settings`} onClick={() => layoutStatus.setActiveTab(1)}>
            <div className={layoutStatus.activeTab === 1 ? 'active' : ''}>
              <Feather icon="settings" size={20} />
              <span>Settings</span>
            </div>
          </Link>
        </div>
      </div>
    </SkeletonTheme>
  );
});
