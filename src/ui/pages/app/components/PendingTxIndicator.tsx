import './PendingTxIndicator.css';

import React, { useEffect } from 'react';

import Feather from 'feather-icons-react';
import anime from 'animejs';
import { observer } from 'mobx-react-lite';

export default observer(({ pendingCount }: { pendingCount: number }) => {
  useEffect(() => {
    anime({
      targets: '.pendingtx-indicator > .icon',
      rotate: '1turn',
      duration: 3000,
      loop: true,
      easing: 'linear',
    });
  }, []);

  return (
    <div className="pendingtx-indicator">
      <span className="count">{pendingCount}</span>
      <Feather className="icon" icon="refresh-cw" size={11} strokeWidth={1.5} />
    </div>
  );
});
