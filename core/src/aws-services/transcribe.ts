import * as AWS from 'aws-sdk';
import {CoreLog} from '../utilities/log';
import {CoreAwsCommonUtils} from './aws-common-utils';

export namespace CoreTranscribe {
  import awsCommand = CoreAwsCommonUtils.awsCommand;
  import log = CoreLog.log;

  const transcribeClient: AWS.TranscribeService = new AWS.TranscribeService({
    apiVersion: '2017-10-26',
    region: 'eu-central-1',
  });

  export class Transcribe {
    constructor(
      private jobName: string,
      private transcribeOutputBucketName: string
    ) {}
    readonly construct = async (): Promise<void> => {
      return await awsCommand(
        async (): Promise<void> => {
          const transcriptionJobRequest: AWS.TranscribeService.StartTranscriptionJobRequest =
            {
              TranscriptionJobName: this.jobName,
              Media: {
                // TODO: extract this parameter
                MediaFileUri: 's3://videostorehash/test.mp4',
              },
              LanguageCode: 'en-US',
              // TODO: extract this parameter
              // MediaFormat: 'mp4',
              // TODO: extract this parameter
              OutputBucketName: this.transcribeOutputBucketName,
              Subtitles: {
                Formats: ['srt'],
                OutputStartIndex: 1,
              },
            };
          const response = await transcribeClient
            .startTranscriptionJob(transcriptionJobRequest)
            .promise();
          log.info(
            `Transcription job for ${
              this.jobName
            } started, response = ${JSON.stringify(response)}`
          );
        },
        async (): Promise<void | null> => {
          return null;
        }
      );
    };
    readonly destroy = async (): Promise<void> => {
      return await awsCommand(
        async (): Promise<void> => {
          const deleteTranscriptionJobRequest: AWS.TranscribeService.DeleteTranscriptionJobRequest =
            {
              TranscriptionJobName: this.jobName,
            };
          await transcribeClient
            .deleteTranscriptionJob(deleteTranscriptionJobRequest)
            .promise();
          log.info(`Transcription job ${this.jobName} is deleted`);
        },
        async (): Promise<void | null> => {
          return null;
        }
      );
    };
  }
}
