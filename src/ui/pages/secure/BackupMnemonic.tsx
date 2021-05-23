import './BackupMnemonic.css';

import React, { useEffect } from 'react';

import { Application } from '../../viewmodels/Application';
import Mnemonic from '../../components/Mnemonic';
import { MnemonicVM } from '../../viewmodels/MnemonicVM';
import { NavBar } from '../../components';
import { observer } from 'mobx-react-lite';

export default observer(({ app, mnVM }: { app: Application; mnVM: MnemonicVM }) => {
  const params = new URLSearchParams(window.location.search);
  const authKey = params.get('authKey');

  useEffect(() => {
    mnVM.readMnemonic(authKey);
    return () => mnVM.clean();
  }, []);

  return (
    <div className="page backup-mnemonic">
      <NavBar title="Backup Mnemonic" onBackClick={() => app.history.goBack()} />

      <div className="content">
        <div>
          <h5>Security Tips</h5>
          <ul>
            <li>The mnemonic consists of English words, please keep them safe.</li>
            <li>Once the mnemonic gets lost, it cannot be retrieved, and you may lose all your funds.</li>
          </ul>
        </div>

        <Mnemonic phrases={mnVM.phrases} />
      </div>
    </div>
  );
});
