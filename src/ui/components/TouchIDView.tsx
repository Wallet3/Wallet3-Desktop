import './TouchIDView.css';

import React, { KeyboardEventHandler, useEffect } from 'react';

import TouchID from '../../assets/icons/app/touchid.svg';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

export default observer(({ onAuth }: { onAuth?: () => void }) => {
  const { t } = useTranslation();

  return (
    <div className="touchid-view">
      <p>{t('Click to authenticate')}</p>
      <div>
        <img src={TouchID} onClick={(_) => onAuth?.()} />
      </div>
    </div>
  );
});
