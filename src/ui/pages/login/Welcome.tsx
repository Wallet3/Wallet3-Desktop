import './Welcome.css';

import { Link } from 'react-router-dom';
import { Logo } from '../../components';
import React from 'react';

export default () => {
  return (
    <div className="page welcome">
      <div className="brand">
        <Logo width={128} height={72} />
        <div className="slogan">A Wallet for Bankless Era</div>
      </div>

      <div className="actions">
        <Link className="button" to="/generate">
          CREATE
        </Link>
        <Link className="button" to="/import">
          IMPORT
        </Link>
      </div>
    </div>
  );
};
