import {useState} from 'react';

import AWS from 'aws-sdk';
import {saveAs} from 'file-saver';
import fixWebmDuration from 'webm-duration-fix';
import {RecordRTCPromisesHandler} from 'recordrtc';
import {InterfacesProjectSpecificConstants} from 'interfaces';

import './VideoRecord.scss';

if (
  !process.env.REACT_APP_AWS_ACCESS_KEY ||
  !process.env.REACT_APP_AWS_SECRET_KEY
) {
  throw new Error('specify amazon access keys before start');
}

const myBucket = new AWS.S3({
  params: {Bucket: InterfacesProjectSpecificConstants.videoStoreHashName},
  region: 'eu-central-1',
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
  },
});

export const VideoRecord = () => {
  const [recorder, setRecorder] = useState<RecordRTCPromisesHandler | null>();
  const [videoBlob, setVideoUrlBlob] = useState<Blob | null>();

  const [progress, setProgress] = useState(0);

  const startRecording = async () => {
    const mediaDevices = navigator.mediaDevices;
    const stream: MediaStream = await mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    const recorder: RecordRTCPromisesHandler = new RecordRTCPromisesHandler(
      stream,
      {
        type: 'video',
      }
    );

    await recorder.startRecording();
    setRecorder(recorder);
    setVideoUrlBlob(null);
  };

  const stopRecording = async () => {
    if (recorder) {
      await recorder.stopRecording();
      const blob: Blob = await recorder.getBlob();
      const newBlob = await fixWebmDuration(blob);
      setVideoUrlBlob(newBlob);
      setRecorder(null);
    }
  };

  const uploadVideo = async () => {
    if (videoBlob) {
      const mp4File = new File([videoBlob], 'test.mp4', {type: 'video/mp4'});
      console.log(mp4File);

      const params = {
        ACL: 'public-read',
        Body: mp4File,
        Bucket: InterfacesProjectSpecificConstants.videoStoreHashName,
        Key: mp4File.name,
      };

      try {
        myBucket
          .putObject(params)
          .on('httpUploadProgress', evt => {
            setProgress(Math.round((evt.loaded / evt.total) * 100));
            console.log(progress);
          })
          .send(err => {
            if (err) {
              console.log(err);
            } else {
              console.log('Video successfully sent');
            }
          });
      } catch (exception) {
        console.log(exception);
      }
      saveAs(mp4File, `Video-${Date.now()}.mp4`);
    }
    setVideoUrlBlob(null);
  };

  return (
    <div>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      <button onClick={uploadVideo}>Upload</button>

      {!!videoBlob && (
        <video
          src={window.URL.createObjectURL(videoBlob)}
          controls
          loop
          className="videoRecord"
        />
      )}
    </div>
  );
};
