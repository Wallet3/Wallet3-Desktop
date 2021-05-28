import './authentication.css';

import * as Anime from '../../misc/Anime';

import React, { useEffect } from 'react';

import { Application } from '../../viewmodels/Application';
import PasscodeView from '../../components/PasscodeView';
import TouchIDView from '../../components/TouchIDView';
import { useTranslation } from 'react-i18next';

export default ({ app }: { app: Application }) => {
  const { touchIDSupported, authExpired, appAuthenticated } = app;

  useEffect(() => {
    app.clearHistory();
  }, []);

  const authViaTouchID = async () => {
    if (await app.promptTouchID('Unlock Wallet')) {
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

// const PasscodeView = ({ app }: { app: Application }) => {
//   const { t } = useTranslation();

//   const onPasscodeChange = async (value: string) => {
//     if (value.length < 6) return;

//     let verified = false;
//     if (!app.appAuthenticated) {
//       verified = await app.authInitialization(value);
//     } else {
//       verified = await app.verifyPassword(value);
//     }

//     if (!verified) {
//       Anime.vibrate('.passcode-view');
//       return;
//     }

//     app.history.push('/app');
//   };

//   return (
//     <div className="passcode-view">
//       <p>{t('Please enter passcode')}</p>
//       <Passcode id="passcode-locking" codeLength={6} hide initialFocus onChange={onPasscodeChange} focusColor="#6186ff" />
//     </div>
//   );
// };

// const TouchIDView = ({ app }: { app: Application }) => {
//   const { t } = useTranslation();

//   const onKeyDown: KeyboardEventHandler<HTMLDivElement> = async (e) => {
//     if (e.code !== 'Space') return;
//     await auth();
//   };

//   const auth = async () => {
//     if (await app.promptTouchID()) {
//       app.history.push('/app');
//     } else {
//       Anime.vibrate('.touchid-view');
//     }
//   };

//   useEffect(() => {
//     (document.getElementsByClassName('touchid-view')[0] as HTMLDivElement)?.focus();

//     anime({
//       targets: '#touchid path',
//       strokeDashoffset: [anime.setDashoffset, 0],
//       easing: 'easeInOutSine',
//       duration: 300,
//       delay: function (el, i) {
//         return i * 50;
//       },
//     });

//     anime({
//       targets: '#touchid',
//       opacity: [0, 1],
//     });
//   }, [app]);

//   return (
//     <div className="touchid-view" tabIndex={0} onKeyDown={onKeyDown}>
//       <p>{t('Press [space] to continue')}</p>
//       <div>
//         <img src={TouchID} onClick={(_) => auth()} />
//       </div>
//     </div>
//   );
// };
