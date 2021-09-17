import './ConfirmTx.css';

import * as Anime from '../../misc/Anime';

import React, { useEffect, useState } from 'react';

import { ApplicationPopup } from '../../viewmodels/ApplicationPopup';
import ApproveView from './confirms/ApproveView';
import AuthView from './confirms/AuthView';
import { CurrencyVM } from '../../viewmodels/settings/CurrencyVM';
import { PopupTitle } from '../../components';
import SignView from './confirms/SignView';
import TransferView from './confirms/TransferView';
import anime from 'animejs';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

interface Props {
  app: ApplicationPopup;
}

export default observer(({ app }: Props) => {
  const { confirmVM, signVM } = app;
  const [onAuthView, setOnAuthView] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const { t } = useTranslation();

  const closeWindow = () =>
    new Promise<void>((resolve) => {
      setAuthenticated(true);
      setTimeout(() => {
        resolve();
        window.close();
      }, 1250);
    });

  const authViaTouchID = async () => {
    if (await (confirmVM ?? signVM).approveRequest('touchid')) {
      await closeWindow();
    } else {
      Anime.vibrate('div.auth > .panel');
    }
  };

  const authViaPassword = async (passcode: string) => {
    if (await (confirmVM ?? signVM).approveRequest('passcode', passcode)) {
      await closeWindow();
    } else {
      Anime.vibrate('div.auth > .panel');
    }
  };

  const onContinue = () => {
    anime({
      targets: '.page.confirm > .container > .details',
      translateX: ['-100vw'],
      easing: 'linear',
      opacity: [0],
      duration: 300,
    });

    anime({
      targets: '.page.confirm > .container > .auth',
      translateX: [0],
      easing: 'linear',
      opacity: [1],
      duration: 300,
      complete: () => setOnAuthView(true),
    });
  };

  const onReject = () => {
    (confirmVM ?? signVM).rejectRequest();
    window.close();
  };

  const onAuthCancel = () => {
    anime({
      targets: '.page.confirm > .container > .details',
      translateX: [0],
      easing: 'linear',
      opacity: [1],
      duration: 300,
    });

    anime({
      targets: '.page.confirm > .container > .auth',
      translateX: ['100vw'],
      easing: 'linear',
      opacity: [0],
      duration: 300,
    });

    (document.querySelector('.positive') as HTMLButtonElement)?.focus();
    setOnAuthView(false);
  };

  useEffect(() => {
    anime({
      targets: '.page.confirm > .container > .details',
      duration: 1,
      translateX: '0px',
    });

    anime({
      targets: '.page.confirm > .container > .auth',
      duration: 1,
      translateX: '100vw',
    });

    document.onkeydown = (ev) => {
      if (ev.code !== 'Enter') return;

      if (onAuthView) return;
      if (confirmVM && !confirmVM?.isValid) return;

      ev.preventDefault();
      ev.stopPropagation();

      onContinue();
    };
  }, []);

  return (
    <div className="page confirm">
      <PopupTitle
        title={t(confirmVM?.method ?? signVM?.method)}
        icon={confirmVM?.flag ?? signVM?.flag}
        chainId={confirmVM?.chainId}
      />

      <div className="container">
        {confirmVM?.method === 'Transfer' ? (
          <TransferView confirmVM={app.confirmVM} currencyVM={app.currencyVM} onContinue={onContinue} onReject={onReject} />
        ) : undefined}

        {confirmVM?.method === 'Approve' ? (
          <ApproveView confirmVM={app.confirmVM} currencyVM={app.currencyVM} onContinue={onContinue} onReject={onReject} />
        ) : undefined}

        {confirmVM?.method === 'Contract Interaction' ? (
          <TransferView confirmVM={app.confirmVM} currencyVM={app.currencyVM} onContinue={onContinue} onReject={onReject} />
        ) : undefined}

        {signVM ? <SignView signVM={signVM} onReject={onReject} onContinue={onContinue} /> : undefined}

        <AuthView
          touchIDSupported={app.touchIDSupported}
          onCancel={onAuthCancel}
          onAuthTouchID={authViaTouchID}
          onAuthPasscode={authViaPassword}
          authenticated={authenticated}
          runTouchID={onAuthView}
          authMethod={app.authMethod}
        />
      </div>
    </div>
  );
});
