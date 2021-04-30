import './Locking.css';

import * as Anime from '../../misc/Anime';

import React, { KeyboardEventHandler, useEffect } from 'react';

import { Application } from '../../viewmodels/Application';
import Passcode from 'react-codes-input';
import TouchID from '../../../assets/icons/app/touchid.svg';
import anime from 'animejs';

export default (args: { app: Application }) => {
  const { app } = args;

  return (
    <div className="page locking">
      {app.touchIDSupported && app.initVerified ? <TouchIDView {...args} /> : <PasscodeView {...args} />}
    </div>
  );
};

const PasscodeView = ({ app }: { app: Application }) => {
  const onPasscodeChange = async (value: string) => {
    if (value.length < 6) return;

    let verified = false;
    if (!app.initVerified) {
      verified = await app.verifyInitialization(value);
    } else {
      verified = await app.verifyPassword(value);
    }

    if (!verified) {
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

const TouchIDView = ({ app }: { app: Application }) => {
  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = async (e) => {
    if (e.code !== 'Space') return;
    await auth();
  };

  const auth = async () => {
    if (await app.promptTouchID()) {
      app.history.push('/app');
    } else {
      Anime.vibrate('.touchid-view');
    }
  };

  useEffect(() => {
    (document.getElementsByClassName('touchid-view')[0] as HTMLDivElement)?.focus();

    anime({
      targets: '#touchid path',
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutSine',
      duration: 300,
      delay: function (el, i) {
        return i * 50;
      },
    });

    anime({
      targets: '#touchid',
      opacity: [0, 1],
    });
  }, [app]);

  return (
    <div className="touchid-view" tabIndex={0} onKeyDown={onKeyDown}>
      <p>Press [space] to continue</p>
      <div>
        <img src={TouchID} onClick={(_) => auth()} />
      </div>
    </div>
  );
};
