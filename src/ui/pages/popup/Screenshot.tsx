import './Screenshot.css';

import React, { useEffect } from 'react';

import DesktopCapturer from '../../bridges/DesktopCapturer';
import delay from 'delay';
import qrscanner from 'qr-scanner';

export default (props) => {
  useEffect(() => {
    appScreenshot(async (data) => {
      console.log('call me', data.length);
      (document.getElementById('screenshot-image') as HTMLImageElement).src = data;

      try {
        const code = await qrscanner.scanImage(data);
        console.log(code);
      } catch (error) {}
    });
  }, [2]);

  return (
    <div className="page screenshot">
      <img id="screenshot-image" />
    </div>
  );
};

function appScreenshot(callback: (data: string) => void, imageFormat?: string) {
  imageFormat = imageFormat || 'image/jpeg';

  const { width, height } = window.screen;
  const handleStream = (stream) => {
    // Create hidden video tag
    var video = document.createElement('video');
    video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';
    // Event connected to stream
    video.onloadedmetadata = () => {
      // Set video ORIGINAL height (screenshot)
      video.style.height = `${height}px`;
      video.style.width = `${width}px`;

      video.play();

      // Create canvas
      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext('2d');
      // Draw video on canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (callback) {
        // Save screenshot to jpg - base64
        callback(canvas.toDataURL(imageFormat));
      } else {
        console.log('Need callback!');
      }

      // Remove hidden video tag
      video.remove();

      try {
        // Destroy connect to stream
        stream.getTracks()[0].stop();
      } catch (e) {}
    };

    video.srcObject = stream;
    document.body.appendChild(video);
  };

  DesktopCapturer.getSources({ types: ['window', 'screen'] }).then(async (sources) => {
    for (const source of sources) {
      console.log(source);

      try {
        const config: any = {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: source.id,
            minWidth: 0,
            minHeight: 0,
            maxWidth: 4000,
            maxHeight: 4000,
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: config,
        });

        handleStream(stream);
        await delay(500);
      } catch (e) {
        console.log(e);
      }
    }
  });
}
