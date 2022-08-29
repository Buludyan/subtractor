import {Context, APIGatewayProxyResult, APIGatewayEvent} from 'aws-lambda';
import {KeyValueStore} from './../aws-services/dynamo-db';
import {
  IVideoName,
  videoNameTypeGuard,
  newVideoName,
} from './../project-specific-interfaces';
import {hashTovideoDynamoTableName} from './../project-specific-constants';

export const plusLambdaHandler = `dist/src/lambdasHandlers/simple-plus-lambda.plus`;

export const plus = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hello world',
    }),
  };
};
