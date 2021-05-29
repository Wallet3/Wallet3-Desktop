import './AuthView.css';

import { PasscodeView, TouchIDView, Validation } from '../../../components';
import React, { useState } from 'react';

import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

export default observer(
  ({
    touchIDSupported,
    onCancel,
    onAuthTouchID,
    onAuthPasscode,
    authenticated,
    runTouchID,
  }: {
    onCancel?: () => void;
    onAuthTouchID?: () => Promise<void>;
    onAuthPasscode?: (passcode: string) => Promise<void>;
    touchIDSupported: boolean;
    runTouchID?: boolean;
    authenticated?: boolean;
  }) => {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [launched, setLaunced] = useState(false);

    const auth = async (passcode?: string) => {
      if (loading) return;
      setLoading(true);

      if (touchIDSupported) {
        await onAuthTouchID?.();
      } else {
        await onAuthPasscode?.(passcode);
      }

      setLoading(false);
    };

    if (runTouchID && touchIDSupported && loading === false && launched == false) {
      setLaunced(true);
      auth();
    }

    return (
      <div className="auth">
        <div className="panel">
          {authenticated ? (
            <Validation />
          ) : touchIDSupported ? (
            <TouchIDView onAuth={auth} />
          ) : (
            <PasscodeView onAuth={auth} />
          )}
        </div>
        <button disabled={loading} onClick={(_) => onCancel?.()}>
          {t('Cancel')}
        </button>
      </div>
    );
  }
);
