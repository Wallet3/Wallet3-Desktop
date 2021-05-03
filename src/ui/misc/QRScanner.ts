import DesktopCapturer from '../bridges/DesktopCapturer';

async function scan(decoder: (imageData: string) => Promise<{ success: boolean; result: string }>) {
  const imageFormat = 'image/jpeg';

  const { width, height } = window.screen;

  const handleStream = (stream: MediaStream) => {
    var video = document.createElement('video'); // Create hidden video tag
    video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';

    const handler = new Promise<string>((resolve) => {
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

        const data = canvas.toDataURL(imageFormat);

        // Remove hidden video tag
        video.remove();

        try {
          // Destroy connect to stream
          stream.getTracks()[0].stop();
        } catch (e) {}

        resolve(data);
      };
    });

    video.srcObject = stream;
    document.body.appendChild(video);

    return handler;
  };

  const sources = await DesktopCapturer.getSources({ types: ['screen', 'window'] });
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
        return result;
      }
    } catch (e) {
      console.log(e);
    }
  }
}

export default scan;
