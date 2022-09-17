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

import newVideoOriginalName = InterfacesProjectSpecificInterfaces.newVideoOriginalName;
import IVideoHashName = InterfacesProjectSpecificInterfaces.IVideoHashName;
import videoHashNameTypeGuard = InterfacesProjectSpecificInterfaces.videoHashNameTypeGuard;
import IGuard = InterfacesProjectSpecificInterfaces.IGuard;
import videoStoreName = InterfacesProjectSpecificConstants.videoStoreName;

if (
  !process.env.REACT_APP_AWS_ACCESS_KEY ||
  !process.env.REACT_APP_AWS_SECRET_KEY
) {
  throw new Error('specify amazon access keys before start');
}

const myBucket = new AWS.S3({
  params: {Bucket: videoStoreName},
  region: 'eu-central-1',
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
  },
});

export type TypeGuardOf<T> = T extends IGuard<infer TypeGuard extends string>
  ? TypeGuard
  : never;
export function makeSureThatXIs<T>(
  x: unknown,
  typeGuard: TypeGuardOf<T>
): asserts x is T {
  if ((x as IGuard<TypeGuardOf<T>>)._guard !== typeGuard) {
    const errorMessage = 'TypeGuard check failed';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

export const UploadBtn = () => {
  const {setVideoUrlBlob} = useActions();
  const {videoBlob, videoFile, videoName} = useAppSelector(
    state => state.subtractor
  );
  console.log(videoName, videoFile);
  const getCorrectVideoFile = (): File => {
    if (videoFile) {
      return videoFile;
    }
    if (videoBlob) {
      return new File([videoBlob], videoName, {type: 'video/mp4'});
    } else {
      throw new Error(`Cannot reach here`);
    }
  };
  const uploadVideo = async () => {
    if (!videoBlob && !videoFile) {
      return;
    }

    const mp4File = getCorrectVideoFile();
    console.log(mp4File);

    try {
      const prepareReqObj = newVideoOriginalName(videoName);
      const prepResponse = await subtractorApi.prepare(prepareReqObj);
      console.log('prepare:', prepResponse);
      const videoHashName = prepResponse.data;
      makeSureThatXIs<IVideoHashName>(videoHashName, videoHashNameTypeGuard);

      const putObjectParams = {
        ACL: 'public-read',
        Body: mp4File,
        Bucket: videoStoreName,
        Key: videoHashName.videoHashName,
      };
      await myBucket.putObject(putObjectParams).promise();
      console.log('Video successfully sent');

      const procResponse = await subtractorApi.process(videoHashName);
      console.log('process:', procResponse);
      // TODO: redirect properly
      window.location.href = 'http://localhost:3000/download';
    } catch (exception) {
      console.log(exception);
      throw exception;
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
