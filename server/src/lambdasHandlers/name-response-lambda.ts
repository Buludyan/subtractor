import {
  isNull,
  isUndefined,
  makeSureThatXIs,
} from './../utilities/common-utils';
import {Context, APIGatewayProxyResult, APIGatewayEvent} from 'aws-lambda';
import * as Constants from '../project-specific-constants';
import {KeyValueStore} from '../aws-services/dynamo-db';
import {
  IVideoName,
  videoNameTypeGuard,
  newVideoName,
} from '../project-specific-interfaces';
import {log} from '../utilities/log';

export const nameLambdaHandler =
  'dist/src/lambdasHandlers/name-response-lambda.nameResponse';

export const nameResponse = async (
  event: APIGatewayEvent,
  context: Context
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
      Constants.hashTovideoDynamoTableName,
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
