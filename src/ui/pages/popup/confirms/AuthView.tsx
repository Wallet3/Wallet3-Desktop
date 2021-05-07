import { ApplicationPopup } from '../../../viewmodels/ApplicationPopup';
import PasscodeView from '../../../components/PasscodeView';
import React from 'react';
import TouchIDView from '../../../components/TouchIDView';
import { observer } from 'mobx-react-lite';

export default observer(
  ({
    app,
    onCancel,
    onAuthTouchID,
    onAuthPasscode,
  }: {
    app: ApplicationPopup;
    onCancel?: () => void;
    onAuthTouchID?: () => void;
    onAuthPasscode?: (passcode: string) => void;
  }) => {
    const { touchIDSupported } = app;

    return (
      <div className="auth">
        <div className="panel">
          {touchIDSupported ? <TouchIDView onAuth={onAuthTouchID} /> : <PasscodeView onAuth={onAuthPasscode} />}
        </div>
        <button onClick={(_) => onCancel?.()}>Cancel</button>
      </div>
    );
  }
);
