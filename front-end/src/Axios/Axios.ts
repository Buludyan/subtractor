import {InterfacesProjectSpecificInterfaces as Interfaces} from 'interfaces';

import axios, {AxiosResponse} from 'axios';

const Axios = axios.create({
  baseURL:
    'https://0luxghyjdg.execute-api.eu-central-1.amazonaws.com/subtractor',
});

export const subtractorApi = {
  prepare(data: Interfaces.IVideoOriginalName): Promise<AxiosResponse> {
    return Axios.post('/prepare', data);
  },

  process(data: Interfaces.IVideoHashName): Promise<AxiosResponse> {
    return Axios.post('/process', data);
  },

  download(data: Interfaces.IVideoHashName): Promise<AxiosResponse> {
    return Axios.post('/download', data);
  },
};
