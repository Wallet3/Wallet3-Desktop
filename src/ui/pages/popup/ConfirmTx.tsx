import './ConfirmTx.css';

import * as Anime from '../../misc/Anime';

import App, { ApplicationPopup } from '../../viewmodels/ApplicationPopup';
import React, { useEffect, useState } from 'react';

import ApproveView from './confirms/ApproveView';
import AuthView from './confirms/AuthView';
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
  const { t } = useTranslation();

  const authViaTouchID = async () => {
    if (await (confirmVM ?? signVM).approveRequest('touchid')) {
      window.close();
    } else {
      Anime.vibrate('div.auth > .panel');
    }
  };

  const authViaPassword = async (passcode: string) => {
    const verified = await (confirmVM ?? signVM).approveRequest('passcode', passcode);

    if (!verified) {
      Anime.vibrate('div.auth > .panel');
      return;
    }

    window.close();
  };

  const onContinue = () => {
    anime({
      targets: '.page.confirm > .container > .details',
      translateX: [0, '-100vw'],
      easing: 'linear',
      opacity: [1, 0],
      duration: 300,
    });

    anime({
      targets: '.page.confirm > .container > .auth',
      translateX: ['100vw', 0],
      easing: 'linear',
      opacity: [0, 1],
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
      translateX: ['-100vw', 0],
      easing: 'linear',
      opacity: [0, 1],
      duration: 300,
    });

    anime({
      targets: '.page.confirm > .container > .auth',
      translateX: [0, '100vw'],
      easing: 'linear',
      opacity: [1, 0],
      duration: 300,
    });

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
          <TransferView implVM={app.confirmVM} onContinue={onContinue} onReject={onReject} />
        ) : undefined}

        {confirmVM?.method === 'Approve' ? (
          <ApproveView confirmVM={app.confirmVM} onContinue={onContinue} onReject={onReject} />
        ) : undefined}

        {confirmVM?.method === 'Contract Interaction' ? (
          <TransferView implVM={app.confirmVM} onContinue={onContinue} onReject={onReject} />
        ) : undefined}

        {signVM ? <SignView signVM={signVM} onReject={onReject} onContinue={onContinue} /> : undefined}

        <AuthView
          touchIDSupported={app.touchIDSupported}
          onCancel={onAuthCancel}
          onAuthTouchID={authViaTouchID}
          onAuthPasscode={authViaPassword}
          runTouchID={onAuthView}
        />
      </div>
    </div>
  );
});
