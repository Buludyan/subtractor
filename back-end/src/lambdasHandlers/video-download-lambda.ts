import {APIGatewayProxyResult, APIGatewayEvent} from 'aws-lambda';
import {
  InterfacesProjectSpecificInterfaces,
  InterfacesProjectSpecificConstants,
} from 'interfaces';
import {CoreCommonUtils} from 'core';
import {CoreS3Bucket} from 'core';
import {CoreDynamoDb} from 'core';
import {CoreLog} from 'core';

export namespace BackEndVideoDownloadLambda {
  import isNull = CoreCommonUtils.isNull;
  import S3Bucket = CoreS3Bucket.S3Bucket;
  import KeyValueStore = CoreDynamoDb.KeyValueStore;
  import makeSureThatXIs = CoreCommonUtils.makeSureThatXIs;
  import IVideoHashName = InterfacesProjectSpecificInterfaces.IVideoHashName;
  import IVideoName = InterfacesProjectSpecificInterfaces.IVideoName;
  import newVideoURL = InterfacesProjectSpecificInterfaces.newVideoURL;
  import newVideoName = InterfacesProjectSpecificInterfaces.newVideoName;
  import videoHashNameTypeGuard = InterfacesProjectSpecificInterfaces.videoHashNameTypeGuard;
  import videoNameTypeGuard = InterfacesProjectSpecificInterfaces.videoNameTypeGuard;
  import transcribeOutputBucketName = InterfacesProjectSpecificConstants.transcribeOutputBucketName;
  import hashTovideoDynamoTableName = InterfacesProjectSpecificConstants.hashTovideoDynamoTableName;
  import log = CoreLog.log;

  export const videoDownloadLambdaHandler =
    'dist/src/lambdasHandlers/video-download-lambda.BackEndVideoDownloadLambda.videoDownloader';

  export const videoDownloader = async (
    event: APIGatewayEvent
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
      const videoNameTable = new KeyValueStore<IVideoName>(
        hashTovideoDynamoTableName,
        videoNameTypeGuard
      );
      await videoNameTable.putRecord(
        body.videoHashName,
        newVideoName(body.videoHashName)
      );
      const originalName = await videoNameTable.getRecord(body.videoHashName);

      const transcribeOutputBucket: S3Bucket = new S3Bucket(
        transcribeOutputBucketName
      );
      const subtitleHashName = body.videoHashName + '.srt';
      if (!transcribeOutputBucket.isFilePresent(subtitleHashName)) {
        return {
          statusCode: 404,
          body: 'Requested file not found',
        };
      }

      await transcribeOutputBucket.setAclToFile(subtitleHashName, true);

      const subtitleName = originalName.videoName + '.srt';
      const videoFileURL = await transcribeOutputBucket.getSignedURL(
        subtitleHashName,
        subtitleName
      );

      if (isNull(videoFileURL)) {
        return {
          statusCode: 404,
          body: 'Requested file not found',
        };
      } else {
        return {
          statusCode: 200,
          body: JSON.stringify(newVideoURL(videoFileURL)),
        };
      }
    } catch (err) {
      log.error(JSON.stringify(err));
      return {
        statusCode: 515,
        body: `Internal Subtractor Error ${err}`,
      };
    }
  };
}
