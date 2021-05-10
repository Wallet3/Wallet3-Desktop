import './ConfirmTx.css';

import * as Anime from '../../misc/Anime';

import App, { ApplicationPopup } from '../../viewmodels/ApplicationPopup';
import React, { useEffect } from 'react';

import ApproveView from './confirms/ApproveView';
import AuthView from './confirms/AuthView';
import { PopupTitle } from '../../components';
import SignView from './confirms/SignView';
import TransferView from './confirms/TransferView';
import anime from 'animejs';
import { observer } from 'mobx-react-lite';

interface Props {
  app: ApplicationPopup;
}

export default observer(({ app }: Props) => {
  const { confirmVM, signVM } = app;

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
      translateX: '-100vw',
      easing: 'linear',
      opacity: 0,
      duration: 300,
    });

    anime({
      targets: '.page.confirm > .container > .auth',
      translateX: ['100vw', 0],
      easing: 'linear',
      opacity: [0, 1],
      duration: 300,
      complete: () => (App.touchIDSupported ? authViaTouchID() : undefined),
    });
  };

  const onReject = () => {
    window.close();
    (confirmVM ?? signVM).rejectRequest();
  };

  const onAuthCancel = () => {
    anime({
      targets: '.page.confirm > .container > .details',
      translateX: ['-100vw', 0],
      easing: 'linear',
      opacity: 1,
      duration: 300,
    });

    anime({
      targets: '.page.confirm > .container > .auth',
      translateX: [0, '100vw'],
      easing: 'linear',
      opacity: 0,
      duration: 300,
    });
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
  }, []);

  return (
    <div className="page confirm">
      <PopupTitle title={confirmVM?.method ?? signVM?.method} icon={confirmVM?.flag ?? signVM?.flag} />

      <div className="container">
        {confirmVM?.method === 'Transfer' ? (
          <TransferView implVM={app.confirmVM} onContinue={onContinue} onReject={onReject} />
        ) : undefined}

        {confirmVM?.method === 'Approve' ? (
          <ApproveView confirmVM={app.confirmVM} onContinue={onContinue} onReject={onReject} />
        ) : undefined}

        {signVM ? <SignView signVM={signVM} onReject={onReject} onContinue={onContinue} /> : undefined}

        <AuthView app={app} onCancel={onAuthCancel} onAuthTouchID={authViaTouchID} onAuthPasscode={authViaPassword} />
      </div>
    </div>
  );
});
