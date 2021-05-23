import './Auth.css';

import * as Anime from '../../misc/Anime';

import { ApplicationPopup } from '../../viewmodels/ApplicationPopup';
import AuthView from './confirms/AuthView';
import Messages from '../../../common/Messages';
import { PopupTitle } from '../../components';
import React from 'react';
import ipc from '../../bridges/IPC';

export default ({ app }: { app: ApplicationPopup }) => {
  const params = new URLSearchParams(window.location.search);
  const authId = params.get('id');

  const authViaTouchID = async () => {
    const result = await app.promptTouchID();

    if (result) {
      ipc.invokeSecure(`${Messages.returnAuthenticationResult(authId)}`, { result });
      window.close();
    } else {
      Anime.vibrate('div.auth > .panel');
    }
  };

  const authViaPassword = async (passcode: string) => {
    const verified = await app.verifyPassword(passcode);

    if (verified) {
      ipc.invokeSecure(`${Messages.returnAuthenticationResult(authId)}`, { result: verified });
      window.close();
    } else {
      Anime.vibrate('div.auth > .panel');
    }
  };

  const onCacnel = () => {
    ipc.invokeSecure(`${Messages.returnAuthenticationResult(authId)}`, { result: false });
    window.close();
  };

  return (
    <div className="page auth">
      <PopupTitle title={'Authentication'} icon={'lock'} />
      <AuthView
        touchIDSupported={app.touchIDSupported}
        onAuthTouchID={authViaTouchID}
        onAuthPasscode={authViaPassword}
        onCancel={onCacnel}
        runTouchID
      />
    </div>
  );
};
