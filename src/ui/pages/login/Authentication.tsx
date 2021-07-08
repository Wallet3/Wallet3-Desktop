import './Authentication.css';

import * as Anime from '../../misc/Anime';

import { Menu, MenuButton, MenuDivider, MenuItem } from '@szhsin/react-menu';
import { PasscodeView, TouchIDView, Validation } from '../../components';
import React, { useEffect, useState } from 'react';

import { AccountType } from '../../../backend/models/Types';
import { Application } from '../../viewmodels/Application';
import Feather from 'feather-icons-react';
import fingerprint from '../../../assets/icons/app/fingerprint.svg';
import keyboardIcon from '../../../assets/icons/app/keyboard.svg';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

const MenuItemStyle = {
  padding: 0,
  fontSize: 12,
};

export default observer(({ app }: { app: Application }) => {
  const { touchIDSupported, authMethod, currentWallet, wallets } = app;
  const { authenticated } = app.currentWallet || {};
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

    const verified = authenticated ? await app.verifyPassword(passcode) : await app.authInitialization(passcode);

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
    if (touchIDSupported && authenticated) {
      document.onkeydown = (ev) => {
        if (!(ev.code === 'Enter' || ev.code === 'Space')) return;
        if (authMethod === 'fingerprint') authViaTouchID();
      };
    }

    return () => (document.onkeydown = undefined);
  }, [app.currentWallet]);

  return (
    <div className="page authentication ">
      <div className={`container ${!authenticated || !touchIDSupported ? 'non-touchid' : ''}`}>
        {validated ? undefined : touchIDSupported && authenticated && authMethod === 'fingerprint' ? (
          <TouchIDView onAuth={authViaTouchID} />
        ) : (
          <PasscodeView onAuth={authViaPassword} />
        )}

        {!validated && (!authenticated || authMethod === 'keyboard') ? (
          <div className="wallets">
            <Menu
              styles={{ minWidth: '100px' }}
              overflow="auto"
              menuButton={() => (
                <MenuButton className="menu-button">
                  <Feather icon={'credit-card'} size={15} />
                  <span>{currentWallet?.name}</span>
                </MenuButton>
              )}
            >
              {wallets.map((k) => {
                return (
                  <MenuItem styles={MenuItemStyle} key={k.id}>
                    <button onClick={(_) => app.switchWallet(k.id)}>
                      <div className={`${currentWallet?.id === k.id ? 'active' : ''}`}>
                        <Feather icon={'credit-card'} size={13} />
                        <span>{k.name}</span>
                      </div>
                    </button>
                  </MenuItem>
                );
              })}
            </Menu>
          </div>
        ) : undefined}

        {validated ? <Validation /> : undefined}
      </div>

      {failedCount >= 5 && !authenticated ? (
        <div className="reset-bar">
          <span onClick={resetApp}>{t('Forgot Passcode? Reset Wallet')}</span>
        </div>
      ) : undefined}

      {authenticated && touchIDSupported && !validated ? (
        <div className="switch-auth-method">
          {app.authMethod === 'fingerprint' ? (
            <img src={keyboardIcon} alt="Keyboard" onClick={(_) => app.switchAuthMethod('keyboard')} />
          ) : (
            <img src={fingerprint} alt="Fingerprint" onClick={(_) => app.switchAuthMethod('fingerprint')} />
          )}
        </div>
      ) : undefined}
    </div>
  );
});
