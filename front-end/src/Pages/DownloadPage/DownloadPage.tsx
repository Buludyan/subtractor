import React, {useEffect, useState} from 'react';
import {InterfacesProjectSpecificInterfaces} from 'interfaces';
import {subtractorApi} from '../../Axios/Axios';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import './DownloadPage';
import CheckIcon from '@mui/icons-material/Check';

export const DownloadPage = () => {
  const [isInProcess, setInProcess] = useState(true);

  useEffect(() => {
    const nameObj: {videoName: string} = JSON.parse(
      localStorage.getItem('videoName') || '{}'
    );
    const interval = setInterval(async () => {
      const downloadReqObj =
        InterfacesProjectSpecificInterfaces.newVideoHashName(nameObj.videoName);
      const downloadResponse = await subtractorApi.download(downloadReqObj);
      if (downloadResponse.status === 200) {
        setInProcess(false);
        window.location.href = downloadResponse.data.videoURL;
        setTimeout(
          () => (window.location.href = 'http://localhost:3000/'),
          1000
        );
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dowload">
      {isInProcess ? (
        <div>
          Video in process
          <Box sx={{display: 'flex'}}>
            <CircularProgress />
          </Box>
        </div>
      ) : (
        <div>
          <div>Video is ready</div>
          <CheckIcon />
        </div>
      )}
    </div>
  );
};
