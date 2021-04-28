import './Import.css';
import './Styles.css';

import { Application } from '../../viewmodels/Application';
import FeatherIcon from 'feather-icons-react';
import React from 'react';
import { observer } from 'mobx-react-lite';

export default observer(({ app }: { app: Application }) => {
  return (
    <div className="page import">
      <div className="form">
        <div className="nav">
          <button className="icon-button" onClick={(_) => app.history.goBack()}>
            <FeatherIcon icon="arrow-left" size={18} />
          </button>
          <h3>Import Mnemonic</h3>
        </div>

        <textarea
          className="mnemonic"
          name=""
          id=""
          cols={30}
          rows={7}
          placeholder="Enter mnemonic phrases separated by spaces"
        />

        <div className="derivation-path">
          <span>Derivation Path</span>
          <input className="path" type="text" defaultValue="m/44'/60'/0'/0" />
        </div>
        <span className="path-desc">If you don't sure what this is, please ignore it</span>
      </div>

      <div></div>

      <button disabled>NEXT</button>
    </div>
  );
});
