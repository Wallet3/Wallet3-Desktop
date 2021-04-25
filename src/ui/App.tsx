import './App.css';

import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Generate, Import, Welcome } from './pages/login/';

import { Main } from './pages/app';
import React from 'react';

export default () => {
  return (
    <BrowserRouter>
      <div id="app">
        <Switch>
          <Route path="/generate" exact component={Generate} />
          <Route path="/import" exact component={Import} />
          <Route path="/welcome" exact component={Welcome} />
          <Route path="/" component={Main} />
        </Switch>
      </div>
    </BrowserRouter>
  );
};
