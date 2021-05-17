import './App.css';

import { Account, Transfer, UserTokens } from './pages/app';
import { Blank, Generate, Import, Locking, SetupPasscode, Welcome } from './pages/login/';
import { Route, Router, Switch } from 'react-router-dom';

import { Application } from './viewmodels/Application';
import MainLayout from './pages/layouts/MainLayout';
import { MnemonicVM } from './viewmodels/MnemonicVM';
import { NetworksVM } from './viewmodels/NetworksVM';
import React from 'react';
import { WalletVM } from './viewmodels/WalletVM';
import { observer } from 'mobx-react-lite';

export default observer((args: { app: Application; mnVM: MnemonicVM; networksVM: NetworksVM; walletVM: WalletVM }) => {
  const { app, walletVM } = args;

  return (
    <Router history={app.history}>
      <div id="app">
        <Switch>
          <Route path="/generate" exact>
            <Generate {...args} />
          </Route>
          <Route path="/import" exact>
            <Import {...args} />
          </Route>
          <Route path="/setupPassword" exact>
            <SetupPasscode {...args} />
          </Route>
          <Route path="/welcome" exact component={Welcome} />
          <Route path="/locking" exact>
            <Locking {...args} />
          </Route>
          <Route path="/app">
            <MainLayout {...args} />
          </Route>
          <Route path="/send">
            <Transfer {...args} />
          </Route>
          <Route path="/account" exact>
            <Account {...args} />
          </Route>
          <Route path={`/userTokens`}>
            <UserTokens {...args} accountVM={walletVM.currentAccount} />
          </Route>

          <Route path="*" component={Blank} />
        </Switch>
      </div>
    </Router>
  );
});
