import {useEffect, useRef} from 'react';
import {useAppSelector} from '../../Hooks/Selector';
import {ControlBtns} from '../ControlBtns/ControlBtns';

import './VideoStream.scss';

export const VideoStream = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const {isRecording, videoUri} = useAppSelector(state => state.subtractor);

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
    <div className="stream" style={{display: videoUri ? 'none' : 'inline'}}>
      <ControlBtns />
      <video
        ref={videoRef}
        className={isRecording ? 'stream__rec' : 'stream__pause'}
      />
    </div>
  );
};
