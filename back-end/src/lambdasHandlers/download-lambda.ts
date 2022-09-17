import {APIGatewayProxyResult, APIGatewayEvent} from 'aws-lambda';
import {
  InterfacesProjectSpecificInterfaces,
  InterfacesProjectSpecificConstants,
} from 'interfaces';
import {CoreCommonUtils} from 'core';
import {CoreS3Bucket} from 'core';
import {CoreDynamoDb} from 'core';
import {CoreLog} from 'core';

export namespace BackEndDownloadLambda {
  import isNull = CoreCommonUtils.isNull;
  import S3Bucket = CoreS3Bucket.S3Bucket;
  import KeyValueStore = CoreDynamoDb.KeyValueStore;
  import makeSureThatXIs = CoreCommonUtils.makeSureThatXIs;
  import IVideoHashName = InterfacesProjectSpecificInterfaces.IVideoHashName;
  import IVideoOriginalName = InterfacesProjectSpecificInterfaces.IVideoOriginalName;
  import newSubtitleSignedUrl = InterfacesProjectSpecificInterfaces.newSubtitleSignedUrl;
  import videoHashNameTypeGuard = InterfacesProjectSpecificInterfaces.videoHashNameTypeGuard;
  import videoOriginalNameTypeGuard = InterfacesProjectSpecificInterfaces.videoOriginalNameTypeGuard;
  import transcribeOutputStoreName = InterfacesProjectSpecificConstants.transcribeOutputStoreName;
  import hashNameToOriginalNameDynamoTableName = InterfacesProjectSpecificConstants.hashNameToOriginalNameDynamoTableName;
  import log = CoreLog.log;

  export const downloadLambdaHandler =
    'dist/src/lambdasHandlers/video-download-lambda.BackEndVideoDownloadLambda.videoDownloader';

  export const videoDownloader = async (
    event: APIGatewayEvent
  ): Promise<APIGatewayProxyResult> => {
    try {
      if (isNull(event.body)) {
        return {
          statusCode: 400,
          body: 'Invalid input, expecting body with \n{\n\t_guard: videoHashNameTypeGuard,\n\tvideoHashName: <hash video name>\n}',
        };
      }
      const body = JSON.parse(event.body);
      makeSureThatXIs<IVideoHashName>(body, videoHashNameTypeGuard);
      const transcribeOutputStore: S3Bucket = new S3Bucket(
        transcribeOutputStoreName
      );
      const subtitleHashName = body.videoHashName + '.srt';
      if (!transcribeOutputStore.isFilePresent(subtitleHashName)) {
        return {
          statusCode: 404,
          body: 'Requested file not found',
          // TODO: investigate
          // headers: {
          //   'Access-Control-Allow-Origin': '*',
          //   'Access-Control-Allow-Headers': 'Content-Type',
          //   'Content-Type': 'application/json',
          // },
        };
      }

      const videoNameTable = new KeyValueStore<IVideoOriginalName>(
        hashNameToOriginalNameDynamoTableName,
        videoOriginalNameTypeGuard
      );
      const originalName = await videoNameTable.getRecord(body.videoHashName);

      await transcribeOutputStore.setAclToFile(subtitleHashName, true);

      const subtitleName = originalName.videoOriginalName + '.srt';
      const videoFileURL = await transcribeOutputStore.getSignedURL(
        subtitleHashName,
        subtitleName
      );

      return {
        statusCode: 200,
        body: JSON.stringify(newSubtitleSignedUrl(videoFileURL)),
        // TODO: investigate
        // headers: {
        //   'Access-Control-Allow-Origin': '*',
        //   'Access-Control-Allow-Headers': 'Content-Type',
        //   'Content-Type': 'application/json',
        // },
      };
    } catch (err) {
      log.error(JSON.stringify(err));
      return {
        statusCode: 515,
        body: `Internal Subtractor Error \n${err}`,
      };
    }
  };
}
