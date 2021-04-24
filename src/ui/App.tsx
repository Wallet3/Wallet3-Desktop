import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link, useRouteMatch, useParams } from 'react-router-dom';
import './App.css';
import Welcome from './pages/login/Welcome';

export default () => {
  return (
    <Router>
      <div id="app">
        <Switch>
          <Route path="/" component={Welcome} />
        </Switch>
      </div>
    </Router>
  );
};
