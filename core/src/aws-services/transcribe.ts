import * as AWS from 'aws-sdk';
import {CoreLog} from '../utilities/log';

export namespace CoreTranscribe {
  import log = CoreLog.log;
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
}
