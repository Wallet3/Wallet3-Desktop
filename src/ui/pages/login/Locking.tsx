import './Locking.css';

import * as Anime from '../../misc/Anime';

import { Application } from '../../viewmodels/Application';
import Passcode from 'react-codes-input';
import React from 'react';

export default (args: { app: Application }) => {
  const { app } = args;

  return (
    <div className="page locking">{app.touchIDSupported ? <PasscodeView {...args} /> : <PasscodeView {...args} />}</div>
  );
};

const PasscodeView = ({ app }: { app: Application }) => {
  const onPasscodeChange = async (value: string) => {
    if (value.length < 6) return;
    if (!(await app.verifyPassword(value))) {
      Anime.vibrate('.passcode-view');
      return;
    }

    app.history.push('/app');
  };

  return (
    <div className="passcode-view">
      <p>Please enter passcode</p>
      <Passcode id="passcode-locking" codeLength={6} hide initialFocus onChange={onPasscodeChange} focusColor="#6186ff" />
    </div>
  );
};
