import './App.css';

import {
  Account,
  AddToken,
  ConnectedDApp,
  ConnectedDApps,
  PendingTx,
  Transfer,
  TransferNFT,
  UserNFTs,
  UserTokens,
} from './pages/app';
import { Authentication, Blank, Generate, Import, SetupPasscode, Welcome } from './pages/login/';
import { BackupMnemonic, Reset } from './pages/secure';
import React, { useEffect } from 'react';
import { Route, Router, Switch, withRouter } from 'react-router-dom';

import { Application } from './viewmodels/Application';
import { CurrencyVM } from './viewmodels/settings/CurrencyVM';
import { LangsVM } from './viewmodels/settings/LangsVM';
import MainLayout from './pages/layouts/MainLayout';
import { MnemonicVM } from './viewmodels/MnemonicVM';
import { NetworksVM } from './viewmodels/NetworksVM';
import { WalletVM } from './viewmodels/WalletVM';
import mousetrap from 'mousetrap';
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

  useEffect(() => {
    mousetrap.bind(['command+l', 'ctrl+l', 'command+L', 'ctrl+L'], () => app.history.push('/authentication'));
  }, []);

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
          <Route path="/setupPassword/:authKey" exact>
            <SetupPasscode {...args} />
          </Route>
          <Route path="/setupPassword/" exact>
            <SetupPasscode {...args} />
          </Route>
          <Route path="/welcome" exact component={Welcome} />
          <Route path="/authentication" exact>
            <Authentication {...args} />
          </Route>
          <Route path="/app">
            <MainLayout {...args} />
          </Route>
          <Route path="/send" exact>
            <Transfer {...args} />
          </Route>
          <Route path="/send/:tokenId" exact>
            <Transfer {...args} />
          </Route>
          <Route path="/transferNFT/:nftId" exact>
            <TransferNFT {...args} accountVM={walletVM.currentAccount} />
          </Route>
          <Route path="/account" exact>
            <Account {...args} />
          </Route>
          <Route path={`/userTokens`}>
            <UserTokens {...args} accountVM={walletVM.currentAccount} />
          </Route>
          <Route path={`/userNFTs`}>
            <UserNFTs {...args} accountVM={walletVM.currentAccount} />
          </Route>
          <Route path={`/addToken`}>
            <AddToken {...args} />
          </Route>
          <Route path="/pendingtx">
            <PendingTx {...args} />
          </Route>
          <Route path="/connectedapp">
            <ConnectedDApp {...args} />
          </Route>
          <Route path="/connectedapps">
            <ConnectedDApps {...args} />
          </Route>
          <Route path="/backupMnemonic/:authKey">
            <BackupMnemonic {...args} />
          </Route>
          <Route path="/reset/:authKey">
            <Reset {...args} />
          </Route>

          <Route path="*" component={Blank} />
        </Switch>
      </div>
    </Router>
  );
});
