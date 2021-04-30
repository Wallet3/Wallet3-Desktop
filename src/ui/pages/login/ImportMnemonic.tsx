import './ImportMnemonic.css';

import * as ethers from 'ethers';

import React, { useState } from 'react';

import { Application } from '../../viewmodels/Application';
import FeatherIcon from 'feather-icons-react';
import { MnemonicVM } from '../../viewmodels/MnemonicVM';
import { NavBar } from '../../components';
import { observer } from 'mobx-react-lite';

export default observer(({ app, mnVM }: { app: Application; mnVM: MnemonicVM }) => {
  const [isValidMnemonic, setIsValidMnemonic] = useState(false);
  const [mnemonic, setMnemonic] = useState('');

  return (
    <div className="page import">
      <div className="form">
        <NavBar title="Import Mnemonic" onBackClick={() => app.history.goBack()} />

        <textarea
          className="mnemonic"
          name=""
          id=""
          cols={30}
          rows={7}
          placeholder="Enter mnemonic phrases separated by spaces"
          onChange={(e) => {
            setMnemonic(e.target.value.trim());
            setIsValidMnemonic(ethers.utils.isValidMnemonic(e.target.value.trim()));
          }}
        />

        <div className="derivation-path">
          <span>Derivation Path</span>
          <input className="path" type="text" defaultValue="m/44'/60'/0'/0" />
        </div>
        <span className="path-desc">If you don't sure what this is, please ignore it</span>
      </div>

      <div></div>

      <button
        disabled={!isValidMnemonic}
        onClick={(_) => {
          if (!isValidMnemonic) return;
          mnVM.saveTmpMnemonic(mnemonic);
          app.history.push('/setupPassword');
        }}
      >
        NEXT
      </button>
    </div>
  );
});
