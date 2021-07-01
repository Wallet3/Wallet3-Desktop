import './Copy.css';

import React, { useState } from 'react';

import CheckIcon from '../../assets/icons/app/check.svg';
import Clipboard from '../bridges/Clipboard';
import CopyIcon from '../../assets/icons/app/copy.svg';

export default ({ content }: { content: string }) => {
  const [showCheck, setShowCheck] = useState(false);

  return (
    <div className="copy">
      {showCheck ? (
        <img src={CheckIcon} alt="Copied" />
      ) : (
        <img
          src={CopyIcon}
          alt="copy"
          onClick={(_) => {
            Clipboard.writeText(content);
            setShowCheck(true);
            setTimeout(() => setShowCheck(false), 3000);
          }}
        />
      )}
    </div>
  );
};
