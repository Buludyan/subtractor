import {Log} from './../utilities/log';
import * as AWS from 'aws-sdk';
import {AWSError} from 'aws-sdk/lib/error';
import * as Utils from '../utilities/common-utils';
import {awsCommand} from './aws-common-utils';

const sqsClient: AWS.SQS = new AWS.SQS({
  apiVersion: '2012-11-05',
  region: 'eu-central-1',
});

export class SQS {
  private queueUrl: string | null = null;
  constructor(private queueName: string) {}
  readonly construct = async () => {
    return await awsCommand(
      async (): Promise<void> => {
        const createParams: AWS.SQS.Types.CreateQueueRequest = {
          QueueName: this.queueName,
          Attributes: {
            DelaySeconds: '10',
            MessageRetentionPeriod: '3600',
            VisibilityTimeout: '60',
          },
        };
        const data = await sqsClient.createQueue(createParams).promise();
        await Utils.sleep(1000);
        //QUESTION
        if (Utils.isUndefined(data.QueueUrl)) {
          Log.error('data.QueueUrl cannot be undefined');
          throw new Error('data.QueueUrl cannot be undefined');
        }
        this.queueUrl = data.QueueUrl;
      },
      async (): Promise<void | null> => {
        return null;
      }
    );
  };
  readonly destroy = async () => {
    return await awsCommand(
      async (): Promise<void> => {
        if (Utils.isNull(this.queueUrl)) {
          return;
        }
        const deleteParams: AWS.SQS.Types.DeleteQueueRequest = {
          QueueUrl: this.queueUrl,
        };
        const data = await sqsClient.deleteQueue(deleteParams).promise();
        await Utils.sleep(60000);
        Log.info(`Queue ${this.queueName} successfully deleted!`);
      },
      async (): Promise<void | null> => {
        return null;
      }
    );
  };
  static readonly list = async () => {
    return await awsCommand(
      async (): Promise<void> => {
        const createParams: AWS.SQS.Types.ListQueuesRequest = {};

        // TODO: handle several pages of queues
        const data = await sqsClient.listQueues(createParams).promise();
        Log.info(`${data.QueueUrls}`);
      },
      async (): Promise<void | null> => {
        return null;
      }
    );
  };
}
