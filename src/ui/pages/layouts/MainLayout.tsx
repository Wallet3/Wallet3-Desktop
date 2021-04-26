import './MainLayout.css';

import { Link, useRouteMatch } from 'react-router-dom';
import React, { useState } from 'react';
import { Route, Switch } from 'react-router';
import { Settings, Wallet } from '../app';

import Feather from 'feather-icons-react';

export default () => {
  const match = useRouteMatch();
  const [active, setActive] = useState(0);
  console.log(match.url, match.path);
  return (
    <div className="layout">
      <div>
        <Switch>
          <Route path={`${match.path}settings`} exact component={Settings} />
          <Route path={match.path} component={Wallet} />
        </Switch>
      </div>

      <div className="tabs">
        <Link to={`${match.url}`} onClick={() => setActive(0)}>
          <div className={active === 0 ? 'active' : ''}>
            <Feather icon="credit-card" size={20} />
            <span>Wallet</span>
          </div>
        </Link>

        <Link to={`${match.url}settings`} onClick={() => setActive(1)}>
          <div className={active === 1 ? 'active' : ''}>
            <Feather icon="settings" size={20} />
            <span>Settings</span>
          </div>
        </Link>
      </div>
    </div>
  );
};
