import './App.css';

import { Blank, Generate, Import, Locking, SetupPasscode, Welcome } from './pages/login/';
import { Route, Router, Switch } from 'react-router-dom';

import { Application } from './viewmodels/Application';
import MainLayout from './pages/layouts/MainLayout';
import { MnemonicVM } from './viewmodels/MnemonicVM';
import React from 'react';
import { observer } from 'mobx-react-lite';

export default observer((args: { app: Application; mnVm: MnemonicVM }) => {
  const { app } = args;

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
          <Route path="/app" component={MainLayout} />
          <Route path="*" component={Blank} />
        </Switch>
      </div>
    </Router>
  );
});
