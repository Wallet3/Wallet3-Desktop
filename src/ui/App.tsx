import './App.css';

import { Account, AddToken, ConnectedDapp, PendingTx, Transfer, UserTokens } from './pages/app';
import { BackupMnemonic, Reset } from './pages/secure';
import { Blank, Generate, Import, Locking, SetupPasscode, Welcome } from './pages/login/';
import { Route, Router, Switch } from 'react-router-dom';

import { Application } from './viewmodels/Application';
import { CurrencyVM } from './viewmodels/CurrencyVM';
import { LangsVM } from './viewmodels/LangsVM';
import MainLayout from './pages/layouts/MainLayout';
import { MnemonicVM } from './viewmodels/MnemonicVM';
import { NetworksVM } from './viewmodels/NetworksVM';
import React from 'react';
import { WalletVM } from './viewmodels/WalletVM';
import { observer } from 'mobx-react-lite';

interface Props {
  app: Application;
  mnVM: MnemonicVM;
  networksVM: NetworksVM;
  walletVM: WalletVM;
  currencyVM: CurrencyVM;
  langsVM: LangsVM;
}

export default observer((args: Props) => {
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
          <Route path={`/addToken`}>
            <AddToken {...args} />
          </Route>
          <Route path="/pendingtx">
            <PendingTx {...args} />
          </Route>
          <Route path="/connectedapp">
            <ConnectedDapp {...args} />
          </Route>
          <Route path="/backupMnemonic">
            <BackupMnemonic {...args} />
          </Route>
          <Route path="/reset">
            <Reset {...args} />
          </Route>

          <Route path="*" component={Blank} />
        </Switch>
      </div>
    </Router>
  );
});
