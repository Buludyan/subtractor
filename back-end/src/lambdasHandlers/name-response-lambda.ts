import {CoreCommonUtils} from 'core';
import {APIGatewayProxyResult, APIGatewayEvent} from 'aws-lambda';
import {CoreDynamoDb} from 'core';
import {InterfacesProjectSpecificInterfaces} from 'interfaces';
import {InterfacesProjectSpecificConstants} from 'interfaces';
import {CoreLog} from 'core';

export namespace BackEndNameResponseLambda {
  import isNull = CoreCommonUtils.isNull;
  import makeSureThatXIs = CoreCommonUtils.makeSureThatXIs;
  import IVideoName = InterfacesProjectSpecificInterfaces.IVideoName;
  import videoNameTypeGuard = InterfacesProjectSpecificInterfaces.videoNameTypeGuard;
  import newVideoName = InterfacesProjectSpecificInterfaces.newVideoName;
  import KeyValueStore = CoreDynamoDb.KeyValueStore;
  import hashToVideoDynamoTableName = InterfacesProjectSpecificConstants.hashToVideoDynamoTableName;
  import log = CoreLog.log;

  export const nameLambdaHandler =
    'dist/src/lambdasHandlers/name-response-lambda.BackEndNameResponseLambda.nameResponse';

  export const nameResponse = async (
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
      makeSureThatXIs<IVideoName>(body, videoNameTypeGuard);
      const myTable = new KeyValueStore<IVideoName>(
        hashToVideoDynamoTableName,
        videoNameTypeGuard
      );

      await myTable.putRecord(body.videoName, newVideoName(body.videoName));

      const record = await myTable.getRecord(body.videoName);
      return {
        statusCode: 200,
        body: JSON.stringify({
          record,
        }),
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
