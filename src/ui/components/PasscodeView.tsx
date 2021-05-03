import './PasscodeView.css';

import * as Anime from '../misc/Anime';

import { Application } from '../viewmodels/Application';
import Passcode from 'react-codes-input';
import React from 'react';
import { observer } from 'mobx-react-lite';

export default observer(({ onAuth }: { onAuth: (passcode: string) => void }) => {
  const onPasscodeChange = async (value: string) => {
    if (value.length < 6) return;
    onAuth?.(value);
  };

  return (
    <div className="passcode-view">
      <p>Please enter passcode</p>
      <Passcode id="passcode-locking" codeLength={6} hide initialFocus onChange={onPasscodeChange} focusColor="#6186ff" />
    </div>
  );
});
