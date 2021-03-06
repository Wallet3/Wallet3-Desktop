import './Auth.css';

import * as Anime from '../../misc/Anime';

import App, { ApplicationPopup } from '../../viewmodels/ApplicationPopup';
import React, { useState } from 'react';

import AuthView from './confirms/AuthView';
import Messages from '../../../common/Messages';
import { PopupTitle } from '../../components';
import ipc from '../../bridges/IPC';
import { useRouteMatch } from 'react-router';
import { useTranslation } from 'react-i18next';

export default ({ app }: { app: ApplicationPopup }) => {
  const { t } = useTranslation();
  const { authId } = useRouteMatch().params as { authId: string };
  const [authenticated, setAuthenticated] = useState(false);

  const closeWindow = () => {
    setAuthenticated(true);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
        setTimeout(() => window.close(), 0);
      }, 1250);
    });
  };

  const authViaTouchID = async () => {
    const success = await app.promptTouchID();

    if (success) {
      await closeWindow();
      ipc.invokeSecure(`${Messages.returnAuthenticationResult(authId)}`, { success });
    } else {
      Anime.vibrate('div.auth > .panel');
    }
  };

  const authViaPassword = async (passcode: string) => {
    const success = await app.verifyPassword(passcode);

    if (success) {
      await closeWindow();
      ipc.invokeSecure(`${Messages.returnAuthenticationResult(authId)}`, { success, password: App.hashPassword(passcode) });
    } else {
      Anime.vibrate('div.auth > .panel');
    }
  };

  const onCancel = () => {
    ipc.invokeSecure(`${Messages.returnAuthenticationResult(authId)}`, { result: false });
    window.close();
  };

  return (
    <div className="page auth">
      <PopupTitle title={t('Authentication')} icon={'lock'} />
      <AuthView
        touchIDSupported={app.touchIDSupported}
        onAuthTouchID={authViaTouchID}
        onAuthPasscode={authViaPassword}
        onCancel={onCancel}
        authMethod={app.authMethod}
        runTouchID
        authenticated={authenticated}
      />
    </div>
  );
};
