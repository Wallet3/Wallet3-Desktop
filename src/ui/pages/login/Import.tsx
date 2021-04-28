import './Import.css';
import './Styles.css';

import FeatherIcon from 'feather-icons-react';
import React from 'react';

export default () => {
  return (
    <div className="page import">
      <div className="form">
        <div className="nav">
          <button className="icon-button">
            <FeatherIcon icon="arrow-left" size={17} />
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
};
