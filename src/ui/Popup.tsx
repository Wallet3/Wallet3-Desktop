import { Route, Router, Switch } from 'react-router-dom';

import { ApplicationPopup } from './viewmodels/ApplicationPopup';
import { Blank } from './pages/login/';
import React from 'react';
import { SendTx } from './pages/popup';
import { observer } from 'mobx-react-lite';

export default observer(({ app }: { app: ApplicationPopup }) => {
  return (
    <Router history={app.history}>
      <Switch>
        <Route path="/sendTx">
          <SendTx />
        </Route>

        <Route path="*" component={Blank} />
      </Switch>
    </Router>
  );
});
