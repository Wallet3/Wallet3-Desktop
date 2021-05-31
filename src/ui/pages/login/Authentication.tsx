import './authentication.css';

import * as Anime from '../../misc/Anime';

import { PasscodeView, TouchIDView, Validation } from '../../components';
import React, { useEffect, useState } from 'react';

import { Application } from '../../viewmodels/Application';
import { useTranslation } from 'react-i18next';

export default ({ app }: { app: Application }) => {
  const { touchIDSupported, appAuthenticated } = app;
  const { t } = useTranslation();
  const [validated, setValidated] = useState(false);
  const [failedCount, setFailedCount] = useState(0);

  const goApp = () => {
    setValidated(true);
    setTimeout(() => app.history.push('/app'), 1250);
  };

  const authViaTouchID = async () => {
    if (await app.promptTouchID(t('Unlock Wallet'))) {
      goApp();
    } else {
      Anime.vibrate('.page.authentication > .container');
      setFailedCount((c) => c + 1);
    }
  };

  const authViaPassword = async (passcode: string) => {
    if (passcode.length < 6) return;

    const verified = appAuthenticated ? await app.verifyPassword(passcode) : await app.authInitialization(passcode);

    if (verified) {
      goApp();
    } else {
      Anime.vibrate('.page.authentication > .container');
      setFailedCount((c) => c + 1);
    }
  };

  const resetApp = async () => {
    const approved = await app.ask({
      title: t('Reset'),
      message: t('Your all data will be deleted, are you sure?'),
      icon: 'alert-triangle',
    });

    if (!approved) return;

    if (await app.reset('forgotpassword-reset')) {
      app.history.push('/welcome');
    }
  };

  useEffect(() => {
    app.clearHistory();

    if (touchIDSupported && appAuthenticated)
      document.onkeydown = (ev) => {
        if (!(ev.code === 'Enter' || ev.code === 'Space')) return;
        authViaTouchID();
      };

    return () => (document.onkeydown = undefined);
  }, []);

  console.log(failedCount);

  return (
    <div className="page authentication ">
      <div className={`container ${!appAuthenticated || !touchIDSupported ? 'non-touchid' : ''}`}>
        {validated ? undefined : touchIDSupported && appAuthenticated ? (
          <TouchIDView onAuth={authViaTouchID} />
        ) : (
          <PasscodeView onAuth={authViaPassword} />
        )}

        {validated ? <Validation /> : undefined}
      </div>

      {failedCount >= 5 && !appAuthenticated ? (
        <div className="reset-bar">
          <span onClick={resetApp}>{t('Forgot Password? Reset Wallet')}</span>
        </div>
      ) : undefined}
    </div>
  );
};
