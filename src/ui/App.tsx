import './App.css';

import { Blank, Generate, Import, Welcome } from './pages/login/';
import { Route, Router, Switch } from 'react-router-dom';

import { Application } from './viewmodels/Application';
import MainLayout from './pages/layouts/MainLayout';
import React from 'react';
import { observer } from 'mobx-react-lite';

export default observer(({ app }: { app: Application }) => {
  return (
    <Router history={app.history}>
      <div id="app">
        <Switch>
          <Route path="/generate" exact component={Generate} />
          <Route path="/import" exact component={Import} />
          <Route path="/welcome" exact component={Welcome} />
          <Route path="/app" exact component={MainLayout} />
          <Route path="/" component={Blank} />
        </Switch>
      </div>
    </Router>
  );
});
