import React from 'react';
import {
  InterfacesProjectSpecificConstants,
  InterfacesProjectSpecificInterfaces,
} from 'interfaces';
import {subtractorApi} from '../../Axios/Axios';
import {useActions} from '../../Hooks/Actions';
import {useAppSelector} from '../../Hooks/Selector';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AWS from 'aws-sdk';
import {IconButton} from '@mui/material';

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

export const UploadBtn = () => {
  const {setVideoUrlBlob} = useActions();
  const {videoBlob, videoFile, videoName} = useAppSelector(
    state => state.subtractor
  );
  console.log(videoName, videoFile);
  const uploadVideo = () => {
    if (videoBlob || videoFile) {
      let mp4File;
      if (videoBlob) {
        mp4File = new File([videoBlob], videoName, {type: 'video/mp4'});
      }
      if (videoFile) {
        mp4File = videoFile;
      }
      console.log(mp4File);
      if (!mp4File) return;

      const params = {
        ACL: 'public-read',
        Body: mp4File,
        Bucket: InterfacesProjectSpecificConstants.videoStoreHashName,
        Key: videoName,
      };

      try {
        myBucket.putObject(params).send(async err => {
          if (err) {
            console.log(err);
          } else {
            console.log('Video successfully sent');
            const prepareReqObj = {
              _guard: InterfacesProjectSpecificInterfaces.videoNameTypeGuard,
              videoName: videoName,
            };
            const prepResponse = await subtractorApi.prepare(prepareReqObj);
            console.log('prepare:', prepResponse);

            const processReqObj = {
              _guard:
                InterfacesProjectSpecificInterfaces.videoHashNameTypeGuard,
              videoHashName: videoName,
            };
            const procResponse = await subtractorApi.process(processReqObj);
            console.log('process:', procResponse);
            window.location.href = 'http://localhost:3000/download';
          }
        });
      } catch (exception) {
        console.log(exception);
      }
    }
    setVideoUrlBlob(null);
  };

  return (
    <div>
      <IconButton onClick={uploadVideo}>
        <FileUploadIcon />
      </IconButton>
    </div>
  );
};
