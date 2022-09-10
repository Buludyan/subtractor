import {APIGatewayProxyResult, APIGatewayEvent} from 'aws-lambda';
import {
  InterfacesProjectSpecificInterfaces,
  InterfacesProjectSpecificConstants,
} from 'interfaces';
import {CoreCommonUtils} from 'core';
import {CoreTranscribe} from 'core';
import {CoreLog} from 'core';

export namespace BackEndTranscribeInvokeLambda {
  import isNull = CoreCommonUtils.isNull;
  import Transcribe = CoreTranscribe.Transcribe;
  import makeSureThatXIs = CoreCommonUtils.makeSureThatXIs;
  import IVideoHashName = InterfacesProjectSpecificInterfaces.IVideoHashName;
  import videoHashNameTypeGuard = InterfacesProjectSpecificInterfaces.videoHashNameTypeGuard;
  import transcribeOutputBucketName = InterfacesProjectSpecificConstants.transcribeOutputBucketName;
  import videoStoreHash = InterfacesProjectSpecificConstants.videoStoreHash;
  import log = CoreLog.log;

  export const transcribeLambdaHandler =
    'dist/src/lambdasHandlers/transcribe-invoke-lambda.BackEndTranscribeInvokeLambda.transcribeInvoke';

  export const transcribeInvoke = async (
    event: APIGatewayEvent
    //context: Context
  ): Promise<APIGatewayProxyResult> => {
    try {
      if (isNull(event.body)) {
        return {
          statusCode: 403,
          body: 'Invalid input',
        };
      }
      const body = JSON.parse(event.body);
      makeSureThatXIs<IVideoHashName>(body, videoHashNameTypeGuard);
      const newJob = new Transcribe(
        body.videoHashName,
        videoStoreHash,
        transcribeOutputBucketName
      );

      await newJob.construct();

      return {
        statusCode: 200,
        body: `Transcription job for ${body.videoHashName} started`,
      };
    } catch (err) {
      log.error(JSON.stringify(err));
      return {
        statusCode: 515,
        body: 'Internal Server Error (our)',
      };
    }
  };
}
