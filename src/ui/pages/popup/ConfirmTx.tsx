import './ConfirmTx.css';

import { PopupTitle } from '../../components';
import React from 'react';
import Window from '../../ipc/Window';
import { observer } from 'mobx-react-lite';

export default observer((props) => {
  return (
    <div className="page tx">
      <PopupTitle />

      <DetailsView />
    </div>
  );
});

const DetailsView = (props) => {
  return (
    <div className="details">
      <div></div>

      <div className="actions">
        <button onClick={(_) => Window.close()}>Cancel</button>
        <button>Continue</button>
      </div>
    </div>
  );
};
