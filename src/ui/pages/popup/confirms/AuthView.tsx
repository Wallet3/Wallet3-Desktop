import './AuthView.css';

import React, { useState } from 'react';

import { ApplicationPopup } from '../../../viewmodels/ApplicationPopup';
import PasscodeView from '../../../components/PasscodeView';
import TouchIDView from '../../../components/TouchIDView';
import { observer } from 'mobx-react-lite';

export default observer(
  ({
    touchIDSupported,
    onCancel,
    onAuthTouchID,
    onAuthPasscode,
    runTouchID,
  }: {
    onCancel?: () => void;
    onAuthTouchID?: () => Promise<void>;
    onAuthPasscode?: (passcode: string) => Promise<void>;
    touchIDSupported: boolean;
    runTouchID?: boolean;
  }) => {
    const [loading, setLoading] = useState(false);
    const [launched, setLaunced] = useState(false);

    const auth = async (passcode?: string) => {
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
        <div className="panel">{touchIDSupported ? <TouchIDView onAuth={auth} /> : <PasscodeView onAuth={auth} />}</div>
        <button disabled={loading} onClick={(_) => onCancel?.()}>
          Cancel
        </button>
      </div>
    );
  }
);
