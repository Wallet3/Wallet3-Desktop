import './App.css';
import 'animate.css/animate.min.css';

import { About, Authentication, Blank, Generate, Import, SetupPasscode, Welcome } from './pages/login/';
import {
  Account,
  AddToken,
  ConnectedDApp,
  ConnectedDApps,
  CustomizeNetwork,
  History,
  Networks,
  Transaction,
  Transfer,
  TransferNFT,
  UserNFTs,
  UserTokens,
} from './pages/app';
import { BackupMnemonic, Reset } from './pages/security';
import React, { useEffect } from 'react';
import { Route, Router, Switch } from 'react-router-dom';

import MainLayout from './pages/layouts/MainLayout';
import { TitleBar } from './components';
import { ViewModels } from '../index';
import WindowApi from './bridges/Window';
import mousetrap from 'mousetrap';
import { observer } from 'mobx-react-lite';

export default observer((args: ViewModels) => {
  const { app } = args;

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
            <TransferNFT {...args} />
          </Route>
          <Route path="/account" exact>
            <Account {...args} />
          </Route>
          <Route path={`/userTokens`}>
            <UserTokens {...args} />
          </Route>
          <Route path={`/userNFTs`}>
            <UserNFTs {...args} />
          </Route>
          <Route path={`/addToken`}>
            <AddToken {...args} />
          </Route>
          <Route path="/tx">
            <Transaction {...args} />
          </Route>
          <Route path="/connectedapp">
            <ConnectedDApp {...args} />
          </Route>
          <Route path="/history">
            <History {...args} />
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
          <Route path="/networks">
            <Networks {...args} />
          </Route>
          <Route path={`/network/:chainId`}>
            <CustomizeNetwork {...args} />
          </Route>

          <Route path="/about">
            <About {...args} />
          </Route>

          <Route path="*" component={Blank} />
        </Switch>

        {app.isMac ? undefined : (
          <TitleBar
            onClose={() => window.close()}
            onMaximize={() => WindowApi.maximize()}
            onMinimize={() => WindowApi.minimize()}
          />
        )}
      </div>
    </Router>
  );
});
