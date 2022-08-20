import * as AWS from 'aws-sdk';

const sqsClient: AWS.TranscribeService = new AWS.TranscribeService({
  apiVersion: '2017-10-26',
  region: 'us-east-1',
});

export class SQS {
  constructor() {}
  readonly deploy = async (): Promise<void> => {
    // TODO: implement
    throw new Error(`Not implemented`);
  };
  readonly undeploy = async (): Promise<void> => {
    // TODO: implement
    throw new Error(`Not implemented`);
  };
}
