import './TouchIDView.css';

import * as Anime from '../misc/Anime';

import React, { KeyboardEventHandler, useEffect } from 'react';

import TouchID from '../../assets/icons/app/touchid.svg';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

export default observer(({ onAuth }: { onAuth?: () => void }) => {
  const { t } = useTranslation();

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = async (e) => {
    if (e.code !== 'Space') return;
    onAuth?.();
  };

  useEffect(() => {
    (document.getElementsByClassName('touchid-view')[0] as HTMLDivElement)?.focus();
  }, [document.body]);

  return (
    <div className="touchid-view" tabIndex={0} onKeyDown={onKeyDown}>
      <p>{t('Press [space] to continue')}</p>
      <div>
        <img src={TouchID} onClick={(_) => onAuth?.()} />
      </div>
    </div>
  );
});
