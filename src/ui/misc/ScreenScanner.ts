import DesktopCapturer from '../bridges/DesktopCapturer';

interface ScanData {
  imgDataUrl: string;
  imgdata: ImageData;
  width: number;
  height: number;
}

async function scan(decoder: (data: ScanData) => Promise<{ success: boolean; result: string }>) {
  const imageFormat = 'image/jpeg';

  const { width, height } = window.screen;

  const handleStream = (stream: MediaStream) => {
    var video = document.createElement('video'); // Create hidden video tag
    video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';

    const handler = new Promise<ScanData>((resolve) => {
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

        const imgDataUrl = canvas.toDataURL(imageFormat);
        const imgdata = canvas.getContext('2d').getImageData(0, 0, width, height);

        // Remove hidden video tag
        video.remove();

        try {
          // Destroy connect to stream
          stream.getTracks()[0].stop();
        } catch (e) {}

        resolve({ imgDataUrl, imgdata, width, height });
      };
    });

    video.srcObject = stream;
    document.body.appendChild(video);

    return handler;
  };

  return new Promise<string>((resolve) => {
    DesktopCapturer.getSources({ types: ['screen', 'window'] }).then(async (sources) => {
      for (const source of sources) {
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

          const image = await handleStream(stream);
          const { result, success } = await decoder(image);

          if (success) {
            resolve(result);
            return;
          }
        } catch (e) {
          console.log(e);
        }
      }

      resolve(undefined);
    });
  });
}

export default scan;
