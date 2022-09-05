import {useEffect, useRef} from 'react';

import './VideoStream.scss';

export const VideoStream = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const streamVideo = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: {width: 500, height: 300},
      })
      .then(stream => {
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;

          video.play();
        }
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    streamVideo();
  }, [videoRef]);

  return (
    <div className="stream">
      <video ref={videoRef}> </video>
    </div>
  );
};
