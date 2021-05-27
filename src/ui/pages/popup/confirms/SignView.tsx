import './SignView.css';

import React from 'react';
import { SignVM } from '../../../viewmodels/SignVM';
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
      <div className="form sign-msg">{signVM.msg ? signVM.msg : signVM.raw.map((v) => v + '\n')}</div>
      <div className="actions">
        <button onClick={(_) => onReject?.()}>{t('Cancel')}</button>
        <button className="positive" onClick={(_) => onContinue?.()}>
          {t('Continue')}
        </button>
      </div>
    </div>
  );
});
