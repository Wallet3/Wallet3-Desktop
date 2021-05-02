import './Blank.css';

import Logo from '../../components/Logo';
import React from 'react';

export default (props) => {
  return (
    <div className="page blank">
      <Logo width={128} height={72} />
      <div className="slogan">A Wallet for Bankless Era</div>
    </div>
  );
};
