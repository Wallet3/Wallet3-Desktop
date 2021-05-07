import './ConfirmTx.css';

import * as Anime from '../../misc/Anime';

import App, { ApplicationPopup } from '../../viewmodels/ApplicationPopup';
import React, { useEffect } from 'react';

import ApproveView from './confirms/ApproveView';
import AuthView from './confirms/AuthView';
import { ConfirmVM } from '../../viewmodels/ConfirmVM';
import Icons from '../../misc/Icons';
import PasscodeView from '../../components/PasscodeView';
import { PopupTitle } from '../../components';
import TouchIDView from '../../components/TouchIDView';
import TransferView from './confirms/TransferView';
import anime from 'animejs';
import { observer } from 'mobx-react-lite';

interface Props {
  app: ApplicationPopup;
}

const authTouchID = async () => {
  if (await App.promptTouchID('Send Tx')) {
    window.close();
  } else {
    Anime.vibrate('div.auth > .panel');
  }
};

const authPassword = async (passcode: string) => {
  const verified = await App.verifyPassword(passcode);

  if (!verified) {
    Anime.vibrate('div.auth > .panel');
    return;
  }

  window.close();
};

export default observer(({ app }: Props) => {
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
      complete: () => (App.touchIDSupported ? authTouchID() : undefined),
    });
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

  const { confirmVM } = app;

  const reject = () => {
    window.close();
    confirmVM.rejectRequest();
  };

  return (
    <div className="page confirm">
      <PopupTitle title={confirmVM?.method} icon={confirmVM?.flag} />
      <div className="container">
        {confirmVM.method === 'Transfer' ? (
          <TransferView implVM={app.confirmVM} onContinue={onContinue} onReject={reject} />
        ) : undefined}

        {confirmVM.method === 'Approve' ? (
          <ApproveView confirmVM={app.confirmVM} onContinue={onContinue} onReject={reject} />
        ) : undefined}

        <AuthView app={app} onCancel={onAuthCancel} onAuthTouchID={authTouchID} onAuthPasscode={authPassword} />
      </div>
    </div>
  );
});
