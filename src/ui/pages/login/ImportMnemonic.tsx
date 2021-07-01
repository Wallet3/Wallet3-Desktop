import './ImportMnemonic.css';

import * as Anime from '../../misc/Anime';
import * as ethers from 'ethers';

import React, { useState } from 'react';

import { Application } from '../../viewmodels/Application';
import { MnemonicVM } from '../../viewmodels/MnemonicVM';
import { NavBar } from '../../components';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

export default observer(({ app, mnVM }: { app: Application; mnVM: MnemonicVM }) => {
  const [isValidMnemonic, setIsValidMnemonic] = useState(false);
  const [mnemonic, setMnemonic] = useState('');
  const { t } = useTranslation();

  return (
    <div className="page import">
      <div className="form">
        <NavBar title={t('Import Secret')} onBackClick={() => app.history.goBack()} />

        <textarea
          className="mnemonic"
          name=""
          id=""
          cols={30}
          rows={7}
          placeholder={t('Import_Mn_Tip')}
          onChange={(e) => {
            setMnemonic(e.target.value.trim());
            setIsValidMnemonic(mnVM.checkSecret(e.target.value.trim()));
          }}
        />

        <div className="derivation-path">
          <span>{t('Derivation Path')}</span>
          <input
            className="path"
            type="text"
            defaultValue="m/44'/60'/0'/0/0"
            onChange={(e) => mnVM.setPath(e.target.value)}
          />
        </div>
        <span className="path-desc">{t('Derivation_Tip')}</span>
      </div>

      <div></div>

      <button
        disabled={!isValidMnemonic}
        onClick={async (_) => {
          if (!isValidMnemonic) return;
          if (!(await mnVM.saveTmpSecret(mnemonic))) {
            Anime.vibrate('textarea.mnemonic');
            return;
          }
          app.history.push('/setupPassword');
        }}
      >
        {t('NEXT')}
      </button>
    </div>
  );
});
