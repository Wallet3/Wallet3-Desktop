import './QRScanner.css';

import React, { useEffect } from 'react';

import { PopupTitle } from '../../components';
import QRCode from '../../../assets/icons/app/qr-code.svg';
import anime from 'animejs';
import qrscanner from 'qr-scanner';
import scanQR from '../../misc/QRScanner';

export default (props) => {
  const scan = () => {
    scanQR(async (imgdata) => {
      try {
        const result = await qrscanner.scanImage(imgdata);
        return { success: true, result };
      } catch (error) {}

      return { success: false, result: '' };
    }).then((result) => {
      console.log(result);
    });
  };

  useEffect(() => {
    anime({
      targets: '.scan-area > .scan-line',
      translateY: ['-64px', '64px'],
      duration: 1250,
      direction: 'alternate',
      easing: 'easeInOutQuart',
      loop: true,
    });

    scan();
  }, [0]);

  return (
    <div className="page qrscanner">
      <PopupTitle title={'WalletConnect'} icon={'link-2'} />
      <div className="content">
        <div className="scan-area">
          <div className="scan-line" />
          <img src={QRCode} alt="" />
        </div>

        <p>{`1. Open System Preferences > Security & Privacy > Privacy > Screen Recording.`} </p>
        <p>{`2. Keep Wallet 3 is checked.`}</p>
      </div>
      <div className="actions">
        <button onClick={(_) => window.close()}>Cancel</button>
        <button onClick={(_) => scan()}>Try Again</button>
      </div>
    </div>
  );
};
