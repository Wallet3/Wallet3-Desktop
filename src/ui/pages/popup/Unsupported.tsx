import './Unsupported.css';

import App, { ApplicationPopup } from '../../viewmodels/ApplicationPopup';

import { PopupTitle } from '../../components';
import React from 'react';
import maintenance from '../../../assets/icons/app/maintenance.svg';
import { useTranslation } from 'react-i18next';

export default ({ app }: { app: ApplicationPopup }) => {
  const { t } = useTranslation();

  return (
    <div className="page unsupported">
      <PopupTitle title={t('Unsupported Network')} />

      <div className="content">
        <img src={maintenance} alt="maintenance" />

        <span>{t('Current network is not supported yet')}</span>
      </div>

      <div className="actions">
        <button
          onClick={(_) => {
            window.close();
          }}
        >
          {t('Cancel')}
        </button>
      </div>
    </div>
  );
};
