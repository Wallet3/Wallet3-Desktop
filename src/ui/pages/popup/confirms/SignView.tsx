import './SignView.css';

import React from 'react';
import ReactJson from 'react-json-view';
import { SignVM } from '../../../viewmodels/popups/SignVM';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

interface Props {
  onReject?: () => void;
  onContinue?: () => void;
  signVM: SignVM;
}

export default observer(({ onReject, onContinue, signVM }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="details">
      <div className={`sign-msg ${signVM.json ? 'json' : ''}`}>
        {signVM.json ? (
          <ReactJson src={signVM.msg as object} enableClipboard={false} displayDataTypes={false} name={false} />
        ) : (
          <pre className="form sign-msg">{signVM.msg ? signVM.msg : signVM.raw.map((v) => v + '\n')}</pre>
        )}
      </div>

      <div className="actions">
        <button onClick={(_) => onReject?.()}>{t('Cancel')}</button>
        <button className="positive" onClick={(_) => onContinue?.()}>
          {t('Continue')}
        </button>
      </div>
    </div>
  );
});
