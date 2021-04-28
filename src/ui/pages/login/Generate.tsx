import './Generate.css';
import './Styles.css';

import React, { useEffect } from 'react';

import { Application } from '../../viewmodels/Application';
import FeatherIcon from 'feather-icons-react';
import Mnemonic from '../../components/Mnemonic';
import { MnemonicVM } from '../../viewmodels/MnemonicVM';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';

export default observer(({ app, mnVm }: { app: Application; mnVm: MnemonicVM }) => {
  useEffect(() => {
    mnVm.requestMnemonic(12);
  }, [mnVm]);

  return (
    <div className="page generate">
      <div>
        <div className="nav">
          <button className="icon-button" onClick={(_) => app.history.goBack()}>
            <FeatherIcon icon="arrow-left" size={18} />
          </button>
          <h3>Mnemonic</h3>
        </div>
        <h5>Security Tips</h5>
        <ul>
          <li>The mnemonic consists of English words, please keep them safe.</li>
          <li>Once the mnemonic gets lost, it cannot be retrieved, and you may lose all your funds.</li>
        </ul>
      </div>

      <div className="seeds no-drag">
        <Mnemonic phrases={mnVm.phrases} />

        <div className="actions">
          <div className="addr">
            <span>Address: </span>
            <span className="addr-value" title={mnVm.address}>
              {mnVm.address}
            </span>
          </div>

          <div className="switch">
            <span className="button active">12</span>
            <span> | </span>
            <span className="button">24</span>
          </div>

          <div className="icon">
            <span className="button">
              <FeatherIcon icon="refresh-cw" size="12" />
            </span>
          </div>
        </div>
      </div>

      <div className="padding"></div>

      <button>NEXT</button>
    </div>
  );
});
