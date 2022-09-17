import React, {ChangeEvent, useEffect} from 'react';
import {VideoRecord} from '../../Components/VideoRecord/VideoRecord';
import {VideoStream} from '../../Components/VideoStream/VideoStream';
import {useActions} from '../../Hooks/Actions';
import {useAppSelector} from '../../Hooks/Selector';
import {InterfacesProjectSpecificConstants} from 'interfaces';

export const RecordPage = () => {
  const {
    setWebcamOn,
    setVideoFile,
    setVideoUri,
    setRecordExist,
    setVideoUrlBlob,
  } = useActions();
  const {isWebcamOn, videoUri} = useAppSelector(state => state.subtractor);

  useEffect(() => {
    localStorage.setItem(
      'videoName',
      JSON.stringify({
        videoName: InterfacesProjectSpecificConstants.videoName,
      })
    );
  }, []);

  const webcamHandler = () => {
    setWebcamOn(true);
    setRecordExist(false);
    setVideoUrlBlob(null);
    setVideoUri(null);
  };

  const fileToDataUri = (file: File) =>
    new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target !== null) {
          resolve(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    });

  const selectVideoHandler = (evt: ChangeEvent<HTMLInputElement>) => {
    if (evt.target.files !== null) {
      const file: File = evt.target.files[0];
      localStorage.setItem(
        'videoName',
        JSON.stringify({
          videoName: file.name,
        })
      );
      setVideoFile(file);
      fileToDataUri(file).then(videoUri => {
        setVideoUri(videoUri as string);
      });
    }
  };

  return (
    <div>
      <div>
        <button onClick={webcamHandler}>Webcam</button>
        or
        <input type={'file'} onChange={evt => selectVideoHandler(evt)} />
      </div>
      {isWebcamOn && <VideoStream />}
      {!!videoUri && <VideoRecord />}
    </div>
  );
};
