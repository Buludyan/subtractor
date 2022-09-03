import { useState } from 'react';
import RecordRTC, {
  RecordRTCPromisesHandler,
} from 'recordrtc';
import './VideoRecord.scss';
//import { uploadFile } from 'react-s3';
import AWS from 'aws-sdk';
import {InterfacesProjectSpecificInterfaces} from 'interfaces'

if(!process.env.REACT_APP_AWS_ACCESS_KEY || !process.env.REACT_APP_AWS_SECRET_KEY) {

  throw new Error('specify amazon access keys before start');
}

const myBucket = new AWS.S3({
  params: { Bucket: 'videostorehash'},
  region: 'eu-central-1',
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY
  }
})

export const VideoRecord = () => {
const [recorder, setRecorder] = useState<RecordRTCPromisesHandler | null>()
const [stream, setStream] = useState<MediaStream | null>()
const [videoBlob, setVideoUrlBlob] = useState<Blob | null>()

const [progress , setProgress] = useState(0);

const startRecording = async () => {
  const mediaDevices = navigator.mediaDevices
  const stream: MediaStream = await mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
      
  const recorder: RecordRTCPromisesHandler = new RecordRTCPromisesHandler(stream, {
    type: 'video',
  })

  await recorder.startRecording()
  setRecorder(recorder)
  setStream(stream)
  setVideoUrlBlob(null)
}

const stopRecording = async () => {
  if (recorder) {
    await recorder.stopRecording()
    const blob: Blob = await recorder.getBlob();
    setVideoUrlBlob(blob)
    setStream(null)
    setRecorder(null)
  }
}

const uploadVideo = async () => {
  if (videoBlob) {
    const variable = InterfacesProjectSpecificInterfaces.videoNameTypeGuard;
    console.log(variable);
    const mp4File = new File([videoBlob], 'video.mp4', { type: 'video/mp4' });

    const params = {
      ACL: 'public-read',
      Body: mp4File,
      Bucket: 'videostorehash',
      Key: mp4File.name
    };

    try {

      myBucket.putObject(params)
      .on('httpUploadProgress', (evt) => {
          setProgress(Math.round((evt.loaded / evt.total) * 100))
      })
      .send((err) => {
          if (err) { 
            console.log(err);
          } else {
            console.log("Video successfully sent");
          }
      })

  } catch (exception) {
      console.log(exception);
  }
    //saveAs(mp4File, `Video-${Date.now()}.mp4`);
  }
  setVideoUrlBlob(null);
}
  return (
    <div>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      <button onClick={uploadVideo}>Upload</button>
      
      {!!videoBlob && (
        <video src={window.URL.createObjectURL(videoBlob)} controls loop className='videoRecord'/>
      )}
    </div>
  )
}
