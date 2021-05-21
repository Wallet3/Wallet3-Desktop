import React, { useState } from 'react';

import { ApplicationPopup } from '../../../viewmodels/ApplicationPopup';
import PasscodeView from '../../../components/PasscodeView';
import TouchIDView from '../../../components/TouchIDView';
import { observer } from 'mobx-react-lite';

export default observer(
  ({
    app,
    onCancel,
    onAuthTouchID,
    onAuthPasscode,
    runTouchID,
  }: {
    app: ApplicationPopup;
    onCancel?: () => void;
    onAuthTouchID?: () => Promise<void>;
    onAuthPasscode?: (passcode: string) => Promise<void>;
    runTouchID?: boolean;
  }) => {
    const { touchIDSupported } = app;
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
