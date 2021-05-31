import { Auth, ConfirmTx, ConnectDapp, MessageBox, QRScanner } from './pages/popup';
import React, { useEffect } from 'react';
import { Route, Router, Switch } from 'react-router-dom';

import { ApplicationPopup } from './viewmodels/ApplicationPopup';
import { Blank } from './pages/login/';
import mousetrap from 'mousetrap';
import { observer } from 'mobx-react-lite';

export default observer(({ app }: { app: ApplicationPopup }) => {
  useEffect(() => {
    if (app.confirmVM || app.connectDappVM || app.signVM || app.msgboxVM) {
      mousetrap.bind('esc', () => {
        app.confirmVM?.rejectRequest();
        app.connectDappVM?.reject();
        app.signVM?.rejectRequest();
        app.msgboxVM?.reject();

        window.close();
      });
    }
  }, []);

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

        <Route path="/auth/:authId">
          <Auth app={app} />
        </Route>

        <Route path="/msgbox">
          <MessageBox app={app} />
        </Route>

        <Route path="*" component={Blank} />
      </Switch>
    </Router>
  );
});
