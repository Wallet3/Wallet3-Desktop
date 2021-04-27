import './App.css';

import { Blank, Generate, Import, Welcome } from './pages/login/';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import MainLayout from './pages/layouts/MainLayout';
// import { Main } from './pages/app';
import React from 'react';

export default () => {
  return (
    <BrowserRouter>
      <div id="app">
        <Switch>
          <Route path="/generate" exact component={Generate} />
          <Route path="/import" exact component={Import} />
          <Route path="/welcome" exact component={Welcome} />
          <Route path="/app" exact component={MainLayout} />
          <Route path="/" component={Blank} />
        </Switch>
      </div>
    </BrowserRouter>
  );
};
