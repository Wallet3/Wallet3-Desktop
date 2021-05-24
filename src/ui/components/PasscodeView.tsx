import './PasscodeView.css';

import * as Anime from '../misc/Anime';

import Passcode from 'react-codes-input';
import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

export default observer(({ onAuth }: { onAuth: (passcode: string) => void }) => {
  const { t } = useTranslation();

  const onPasscodeChange = async (value: string) => {
    if (value.length < 6) return;
    onAuth?.(value);
  };

  return (
    <div className="passcode-view">
      <p>{t('Please enter passcode')}</p>
      <Passcode id="passcode-locking" codeLength={6} hide initialFocus onChange={onPasscodeChange} focusColor="#6186ff" />
    </div>
  );
});
