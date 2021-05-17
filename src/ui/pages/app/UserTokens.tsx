import './UserTokens.css';

import { AccountVM } from '../../viewmodels/AccountVM';
import { Application } from '../../viewmodels/Application';
import { NavBar } from '../../components';
import React from 'react';
import { observer } from 'mobx-react-lite';

export default observer(({ accountVM, app }: { accountVM?: AccountVM; app: Application }) => {
  return (
    <div className="page tokens">
      <NavBar title="Tokens" onBackClick={() => app.history.goBack()} />

      <div className="content"></div>
    </div>
  );
});
