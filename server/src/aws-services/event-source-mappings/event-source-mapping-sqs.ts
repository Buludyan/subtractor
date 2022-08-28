import * as AWS from 'aws-sdk';
import {
  isNull,
  throwIfNull,
  throwIfUndefined,
} from '../../utilities/common-utils';
import {Log} from '../../utilities/log';
import {awsCommand} from '../aws-common-utils';

const lambdaClient: AWS.Lambda = new AWS.Lambda({
  apiVersion: '2015-03-31',
  region: 'eu-central-1',
});

export class EventSourceMappingSQS {
  uuid: string | null = null;
  constructor(private queueARN: string, private lambdaName: string) {}
  readonly construct = async () => {
    Log.info(
      `Creating event source mapping between lambda ${this.lambdaName} and queue ${this.queueARN}.`
    );
    this.uuid = await awsCommand(
      async (): Promise<string> => {
        const createEventSourceMappingParams: AWS.Lambda.Types.CreateEventSourceMappingRequest =
          {
            BatchSize: 10,
            MaximumBatchingWindowInSeconds: 1,
            Enabled: true,
            EventSourceArn: this.queueARN,
            FunctionName: this.lambdaName,
          };
        const data = await lambdaClient
          .createEventSourceMapping(createEventSourceMappingParams)
          .promise();
        throwIfUndefined(data.UUID);
        return data.UUID;
      },
      async (err): Promise<string | null> => {
        if (err.code === 'ResourceConflictException') {
          Log.info(
            `The EventSourceMapping already exists, or another operation is in progress.`
          );
          const uuid = err.message.match(/[\d\w-]+$/);
          if (isNull(uuid) || uuid.length === 0) {
            const message = `Error message does not contain uuid of EventSourceMapping, AWS error: ${err}`;
            Log.error(message);
            throw new Error(message);
          }
          return uuid[0];
        }
        return null;
      }
    );
    return this.uuid;
  };
  readonly destroy = async () => {
    const eventSourceMappingUUID = this.uuid;
    throwIfNull(eventSourceMappingUUID);
    Log.info(`Deleting event source mapping, UUID=${eventSourceMappingUUID}`);
    return await awsCommand(
      async (): Promise<void> => {
        const deleteEventSourceMappingParams: AWS.Lambda.Types.DeleteEventSourceMappingRequest =
          {
            UUID: eventSourceMappingUUID,
          };
        await lambdaClient
          .deleteEventSourceMapping(deleteEventSourceMappingParams)
          .promise();
        Log.info(
          `Event source mapping deleted, UUID=${eventSourceMappingUUID}`
        );
      },
      async (err): Promise<void | null> => {
        if (err.code === 'ResourceNotFoundException') {
          Log.info(
            `Event source mapping does not exists, UUID=${eventSourceMappingUUID}`
          );
        }
        return null;
      }
    );
  };
  readonly getUuid = async () => {
    return this.uuid;
  };
}
