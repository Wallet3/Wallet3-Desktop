import './QRScanner.css';

import * as Anime from '../../misc/Anime';

import Messages, { BooleanResult } from '../../../common/Messages';
import React, { useEffect, useState } from 'react';

import { PopupTitle } from '../../components';
import QRCode from '../../../assets/icons/app/qr-code.svg';
import ScreenScanner from '../../misc/ScreenScanner';
import anime from 'animejs';
import ipc from '../../bridges/IPC';
import jsQR from 'jsqr';
import { useTranslation } from 'react-i18next';

export default () => {
  const [scanning, setScanning] = useState(false);
  const { t } = useTranslation();

  const scanWalletConnect = async () => {
    setScanning(true);

    try {
      const uri = await ScreenScanner(async (scanning) => {
        const { imgdata, width, height } = scanning;

        try {
          const result = jsQR(imgdata.data, width, height, {});

          if (result && result.data.toLowerCase().startsWith('wc:')) {
            return { success: true, result: result.data };
          }
        } catch (error) {}

        return { success: false, result: '' };
      });

      if (window.closed) return;
      if (!uri) return;

      const { success } = await ipc.invokeSecure<BooleanResult>(Messages.connectWallet, { uri });
      if (success) {
        window.close();
      } else {
        Anime.vibrate('.scan-area', () => window.close());
      }
    } finally {
      setScanning(false);
    }
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

    anime({
      targets: '.scan-area > img',
      opacity: 0.5,
      duration: 1250,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutQuart',
    });

    scanWalletConnect();
  }, []);

  return (
    <div className="page qrscanner">
      <PopupTitle title={'WalletConnect'} icon={'link-2'} />
      <div className="content">
        <div className="scan-area">
          <div className="scan-line" />
          <img src={QRCode} alt="" />
        </div>

        <p>{t('WalletConnect_Tip1')} </p>
        <p>{t('WalletConnect_Tip2')}</p>
      </div>
      <div className="actions">
        <button onClick={(_) => window.close()}>{t('Cancel')}</button>
        <button disabled={scanning} onClick={(_) => scanWalletConnect()}>
          {t('Try Again')}
        </button>
      </div>
    </div>
  );
};
