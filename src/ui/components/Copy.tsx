import './Copy.css';

import React, { useState } from 'react';

import CheckIcon from '../../assets/icons/app/check.svg';
import Clipboard from '../bridges/Clipboard';
import CopyIcon from '../../assets/icons/app/copy.svg';
import { useEffect } from 'react';

export default ({ content }: { content: string }) => {
  const [showCheck, setShowCheck] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timer>(null);

  useEffect(() => {
    return clearTimeout(timer);
  }, []);

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
            setTimer(setTimeout(() => setShowCheck(false), 3000));
          }}
        />
      )}
    </div>
  );
};
