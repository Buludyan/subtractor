import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {InitialState} from '../Interfaces/Interfaces';
import {InterfacesProjectSpecificConstants} from 'interfaces';

const initialState: InitialState = {
  isRecording: false,
  isRecordExist: false,
  isWebcamOn: false,
  videoBlob: null,
  videoFile: null,
  videoName: InterfacesProjectSpecificConstants.videoName,
  videoUri: null,
};

export const subtractorSlice = createSlice({
  name: 'subtractor',
  initialState,
  reducers: {
    setRecording: (state, action: PayloadAction<boolean>) => {
      state.isRecording = action.payload;
    },
    setRecordExist: (state, action: PayloadAction<boolean>) => {
      state.isRecordExist = action.payload;
    },
    setWebcamOn: (state, action: PayloadAction<boolean>) => {
      state.isWebcamOn = action.payload;
    },
    setVideoUrlBlob: (state, action: PayloadAction<Blob | null>) => {
      state.videoBlob = action.payload;
    },
    setVideoFile: (state, action: PayloadAction<File>) => {
      state.videoFile = action.payload;
      state.videoName = action.payload.name;
    },
    setVideoUri: (state, action: PayloadAction<string | null>) => {
      state.videoUri = action.payload;
    },
  },
});

export const subtractorActions = subtractorSlice.actions;
export const subtractorReducer = subtractorSlice.reducer;
