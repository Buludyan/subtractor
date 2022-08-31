import * as AWS from 'aws-sdk';
import {log, Log} from '../utilities/log';

const sqsClient: AWS.TranscribeService = new AWS.TranscribeService({
  apiVersion: '2017-10-26',
  region: 'eu-central-1',
});

export class Transcribe {
  constructor() {}
  readonly construct = async (): Promise<void> => {
    // TODO: implement
    log.throw('Not implemented');
  };
  readonly destroy = async (): Promise<void> => {
    // TODO: implement
    log.throw('Not implemented');
  };
}
