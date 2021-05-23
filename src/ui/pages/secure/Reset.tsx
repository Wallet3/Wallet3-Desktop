import './Reset.css';

import { Application } from '../../viewmodels/Application';
import Feather from 'feather-icons-react';
import { NavBar } from '../../components';
import React from 'react';

export default ({ app }: { app: Application }) => {
  const reset = async () => {
    const params = new URLSearchParams(window.location.search);
    const authKey = params.get('authKey');

    if (await app.reset(authKey)) {
      app.history.push('/welcome');
    }
  };

  return (
    <div className="page reset">
      <NavBar title="Reset" onBackClick={() => app.history.goBack()} />
      <div className="content">
        <Feather icon="alert-triangle" size={64} strokeWidth={1} />
        <p>
          The operation is not reversible. <br />
          Please keep your mnemonic safe.
        </p>
      </div>
      <button onClick={(_) => reset()}>Reset</button>
    </div>
  );
};
