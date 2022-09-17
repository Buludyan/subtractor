import React, {useState} from 'react';
import fixWebmDuration from 'webm-duration-fix';
import {RecordRTCPromisesHandler} from 'recordrtc';
import {useActions} from '../../Hooks/Actions';
import './ControlBtns.scss';
import {IconButton} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

export const ControlBtns = () => {
  const [recorder, setRecorder] = useState<RecordRTCPromisesHandler | null>();
  const {setRecording, setRecordExist, setVideoUrlBlob, setVideoUri} =
    useActions();

  const startRecording = async () => {
    const mediaDevices = navigator.mediaDevices;
    const stream: MediaStream = await mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    const recorder: RecordRTCPromisesHandler = new RecordRTCPromisesHandler(
      stream,
      {type: 'video'}
    );

    await recorder.startRecording();
    setRecorder(recorder);
    setRecording(true);
  };

  const stopRecording = async () => {
    if (recorder) {
      await recorder.stopRecording();
      const blob: Blob = await recorder.getBlob();
      const newBlob = await fixWebmDuration(blob);
      setVideoUrlBlob(newBlob);
      setVideoUri(window.URL.createObjectURL(newBlob));
      setRecorder(null);
      setRecording(false);
      setRecordExist(true);
    }
  };

  return (
    <div className="btns">
      <div className="btns__inner">
        <IconButton onClick={startRecording}>
          <PlayArrowIcon />
        </IconButton>
        <IconButton onClick={stopRecording}>
          <StopIcon />
        </IconButton>
      </div>
    </div>
  );
};
