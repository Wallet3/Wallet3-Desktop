import './SendTx.css';

import { Logo } from '../../components';
import React from 'react';
import { observer } from 'mobx-react-lite';

export default observer((props) => {
  return (
    <div className="page tx">
      <div className="title">
        <Logo width={72} fill="#333" />
      </div>
    </div>
  );
});
