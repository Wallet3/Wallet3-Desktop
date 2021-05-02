import { Route, Router, Switch } from 'react-router-dom';

import { ApplicationPopup } from './viewmodels/ApplicationPopup';
import { Blank } from './pages/login/';
import { ConfirmTx } from './pages/popup';
import React from 'react';
import { observer } from 'mobx-react-lite';

export default observer(({ app }: { app: ApplicationPopup }) => {
  return (
    <Router history={app.history}>
      <Switch>
        <Route path="/sendTx">
          <ConfirmTx app={app} />
        </Route>

        <Route path="*" component={Blank} />
      </Switch>
    </Router>
  );
});
