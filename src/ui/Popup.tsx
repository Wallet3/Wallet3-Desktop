import { Auth, ConfirmTx, ConnectDapp, QRScanner } from './pages/popup';
import { Route, Router, Switch } from 'react-router-dom';

import { ApplicationPopup } from './viewmodels/ApplicationPopup';
import { Blank } from './pages/login/';
import React from 'react';
import { observer } from 'mobx-react-lite';

export default observer(({ app }: { app: ApplicationPopup }) => {
  return (
    <Router history={app.history}>
      <Switch>
        <Route path="/sendTx">
          <ConfirmTx app={app} />
        </Route>

        <Route path="/scanQR">
          <QRScanner />
        </Route>

        <Route path="/connectDapp">
          <ConnectDapp app={app} />
        </Route>

        <Route path="/sign">
          <ConfirmTx app={app} />
        </Route>

        <Route path="/auth">
          <Auth app={app} />
        </Route>

        <Route path="*" component={Blank} />
      </Switch>
    </Router>
  );
});
