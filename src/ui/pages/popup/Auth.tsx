import './Auth.css';

import { ApplicationPopup } from '../../viewmodels/ApplicationPopup';
import AuthView from './confirms/AuthView';
import { PopupTitle } from '../../components';
import React from 'react';

export default ({ app }: { app: ApplicationPopup }) => {
  return (
    <div className="page auth">
      <PopupTitle title={'Authentication'} icon={'key'} />
      <AuthView app={app} />
    </div>
  );
};
