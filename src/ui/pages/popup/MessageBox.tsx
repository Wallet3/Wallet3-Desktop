import './MessageBox.css';

import App, { ApplicationPopup } from '../../viewmodels/ApplicationPopup';

import { PopupTitle } from '../../components';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default ({ app }: { app: ApplicationPopup }) => {
  const { t } = useTranslation();
  const { msgboxVM } = app;

  return (
    <div className="page messagebox">
      <PopupTitle title={msgboxVM.title} icon={msgboxVM.icon} />

      <div className="content">{msgboxVM.message}</div>

      <div className="actions">
        <button
          onClick={(_) => {
            msgboxVM.reject();
            window.close();
          }}
        >
          {t('Cancel')}
        </button>
        <button
          className="positive"
          onClick={(_) => {
            msgboxVM.approve();
            window.close();
          }}
        >
          {t('OK')}
        </button>
      </div>
    </div>
  );
};
