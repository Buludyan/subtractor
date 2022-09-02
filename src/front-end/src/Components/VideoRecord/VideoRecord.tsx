import { useState } from 'react';
import RecordRTC, {
  RecordRTCPromisesHandler,
} from 'recordrtc';
import './VideoRecord.scss';
//import { uploadFile } from 'react-s3';
import AWS from 'aws-sdk';

const s3Config = {
  bucketName:  'videostorehash',
  region: 'eu-central-1',
}

const myBucket = new AWS.S3({
  params: { Bucket: s3Config.bucketName},
  region: s3Config.region,
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
    const mp4File = new File([videoBlob], 'video.mp4', { type: 'video/mp4' });

    const params = {
      ACL: 'public-read',
      Body: mp4File,
      Bucket: s3Config.bucketName,
      Key: mp4File.name
    };

    try {
      myBucket.putObject(params)
      .on('httpUploadProgress', (evt) => {
          setProgress(Math.round((evt.loaded / evt.total) * 100))
      })
      .send((err) => {
          if (err) console.log(err)
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
