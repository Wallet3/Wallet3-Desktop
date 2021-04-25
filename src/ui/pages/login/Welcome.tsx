import './Welcome.css';

import { Link } from 'react-router-dom';
import React from 'react';

export default () => {
  return (
    <div className="page welcome">
      <div className="brand">
        <span className="logo">Wallet 3</span>
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
