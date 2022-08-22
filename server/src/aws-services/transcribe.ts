import * as AWS from 'aws-sdk';

const sqsClient: AWS.TranscribeService = new AWS.TranscribeService({
  apiVersion: '2017-10-26',
  region: 'eu-central-1',
});

export class Transcribe {
  constructor() {}
  readonly construct = async (): Promise<void> => {
    // TODO: implement
    throw new Error(`Not implemented`);
  };
  readonly destroy = async (): Promise<void> => {
    // TODO: implement
    throw new Error(`Not implemented`);
  };
}
