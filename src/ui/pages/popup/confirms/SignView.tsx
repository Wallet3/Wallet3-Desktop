import './SignView.css';

import React from 'react';
import { SignVM } from '../../../viewmodels/SignVM';
import { observer } from 'mobx-react-lite';

export default observer(
  ({ onReject, onContinue, signVM }: { onReject?: () => void; onContinue?: () => void; signVM: SignVM }) => {
    return (
      <div className="details">
        <div className="form sign-msg">{signVM.signMsg.map((v) => v + '\n')}</div>
        <div className="actions">
          <button onClick={(_) => onReject?.()}>Cancel</button>
          <button onClick={(_) => onContinue?.()}>Continue</button>
        </div>
      </div>
    );
  }
);
