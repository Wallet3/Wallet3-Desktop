import './authentication.css';

import * as Anime from '../../misc/Anime';

import React, { useEffect } from 'react';

import { Application } from '../../viewmodels/Application';
import PasscodeView from '../../components/PasscodeView';
import TouchIDView from '../../components/TouchIDView';
import { useTranslation } from 'react-i18next';

export default ({ app }: { app: Application }) => {
  const { touchIDSupported, authExpired, appAuthenticated } = app;
  const { t } = useTranslation();

  useEffect(() => {
    app.clearHistory();
  }, []);

  const authViaTouchID = async () => {
    if (await app.promptTouchID(t('Unlock Wallet'))) {
      app.history.push('/app');
    } else {
      Anime.vibrate('.page.authentication > .container');
    }
  };

  const authViaPassword = async (passcode: string) => {
    if (passcode.length < 6) return;

    const verified = appAuthenticated ? await app.verifyPassword(passcode) : await app.authInitialization(passcode);

    if (verified) {
      app.history.push('/app');
    } else {
      Anime.vibrate('.page.authentication > .container');
    }
  };

  return (
    <div className="page authentication">
      <div className="container">
        {touchIDSupported && appAuthenticated && authExpired ? (
          <TouchIDView onAuth={authViaTouchID} />
        ) : (
          <PasscodeView onAuth={(passcode) => authViaPassword(passcode)} />
        )}
      </div>
    </div>
  );
};
