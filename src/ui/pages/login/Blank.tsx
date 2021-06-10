import './Blank.css';

import Logo from '../../components/Logo';
import React from 'react';

export default () => {
  return (
    <div className="page blank">
      <Logo className="animate__animated animate__fadeInUp" opacity={0} width={128} height={72} />
      <div className="slogan animate__animated animate__fadeInUp animate__delay-1s">A Secure Wallet for Bankless Era</div>
    </div>
  );
};
