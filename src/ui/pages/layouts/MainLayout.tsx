import './MainLayout.css';

import { Link, useRouteMatch } from 'react-router-dom';
import React, { useState } from 'react';
import { Route, Switch } from 'react-router';
import { Settings, Wallet } from '../app';

import Feather from 'feather-icons-react';

export default () => {
  let { path, url } = useRouteMatch();

  const [active, setActive] = useState(0);
  console.log(url, path);
  return (
    <div className="layout">
      <div>
        <Switch>
          <Route path={`${path}/settings`} component={Settings} />
          <Route path={path} component={Wallet} />
        </Switch>
      </div>

      <div className="tabs">
        <Link to={`${url}`} onClick={() => setActive(0)}>
          <div className={active === 0 ? 'active' : ''}>
            <Feather icon="credit-card" size={20} />
            <span>Wallet</span>
          </div>
        </Link>

        <Link to={`${url}/settings`} onClick={() => setActive(1)}>
          <div className={active === 1 ? 'active' : ''}>
            <Feather icon="settings" size={20} />
            <span>Settings</span>
          </div>
        </Link>
      </div>
    </div>
  );
};
