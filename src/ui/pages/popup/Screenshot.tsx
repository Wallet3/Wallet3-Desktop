import './Screenshot.css';

import React, { useEffect } from 'react';

import DesktopCapturer from '../../bridges/DesktopCapturer';

export default (props) => {
  useEffect(() => {
    DesktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
      (document.getElementById('screenshot-image') as HTMLImageElement).src = sources[0].thumbnail.toDataURL(); // The image to display the screenshot
    });
  }, [2]);

  return (
    <div className="page screenshot">
      <img id="screenshot-image" />
    </div>
  );
};
