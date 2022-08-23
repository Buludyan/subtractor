import {Log} from './../utilities/log';
import {AWSError} from 'aws-sdk/lib/error';
import * as AWS from 'aws-sdk';
import {awsCommand} from './aws-common-utils';
import {IGuard, makeSureThatXIs, TypeGuardOf} from '../utilities/common-utils';

const dynamoClient: AWS.DynamoDB = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region: 'eu-central-1',
});

const dynamoDocClient: AWS.DynamoDB.DocumentClient =
  new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: 'eu-central-1',
  });

export class KeyValueStore<RecordType extends IGuard<TypeGuardOf<RecordType>>> {
  constructor(
    private tableName: string,
    private typeGuard: TypeGuardOf<RecordType>
  ) {}

  readonly construct = async (): Promise<void> => {
    return await awsCommand(
      async (): Promise<void> => {
        const createTableReq: AWS.DynamoDB.Types.CreateTableInput = {
          AttributeDefinitions: [
            {
              AttributeName: 'hashKey',
              AttributeType: 'S',
            },
          ],
          BillingMode: 'PROVISIONED',
          KeySchema: [
            {
              AttributeName: 'hashKey',
              KeyType: 'HASH',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1, //TODO: refine
            WriteCapacityUnits: 1,
          },
          TableClass: 'STANDARD',
          TableName: this.tableName,
        };

        await dynamoClient.createTable(createTableReq).promise();
        Log.info(`Table ${this.tableName} is created`);
      },
      async (err: AWSError): Promise<void | null> => {
        if (err.code === 'ResourceInUseException') {
          Log.error(`Table ${this.tableName} is already created`);
          return;
        }
        return null;
      }
    );
  };
  readonly destroy = async (): Promise<void> => {
    return await awsCommand(
      async (): Promise<void> => {
        const deleteTableReq: AWS.DynamoDB.Types.DeleteTableInput = {
          TableName: this.tableName,
        };

        await dynamoClient.deleteTable(deleteTableReq).promise();
        Log.info(`Table ${this.tableName} is deleted`);
      },
      async (err: AWSError): Promise<void | null> => {
        if (err.code === 'ResourceNotFoundException') {
          Log.error(`Table ${this.tableName} is not found`);
          return;
        }
        return null;
      }
    );
  };
  readonly putRecord = async (
    hashKey: string,
    record: RecordType
  ): Promise<void> => {
    return await awsCommand(
      async (): Promise<void> => {
        const putItemInput: AWS.DynamoDB.DocumentClient.PutItemInput = {
          Item: {
            hashKey: hashKey,
            record: record,
          },
          TableName: this.tableName,
          ConditionExpression: 'not (attribute_exists(hashKey))',
        };

        await dynamoDocClient.put(putItemInput).promise();
        Log.info(`Item ${hashKey} is inserted`);
      },
      async (err: AWSError): Promise<void | null> => {
        if (err.code === 'ConditionalCheckFailedException') {
          Log.error(`Item ${hashKey} is already existed`);
          return;
        }
        return null;
      }
    );
  };
  readonly getRecord = async (hashKey: string): Promise<RecordType> => {
    return await awsCommand(
      async (): Promise<RecordType> => {
        const getItemInput: AWS.DynamoDB.DocumentClient.GetItemInput = {
          Key: {
            hashKey: hashKey,
          },
          TableName: this.tableName,
        };

        const response = await dynamoDocClient.get(getItemInput).promise();
        Log.info(`Successfully get ${response.Item}`);
        makeSureThatXIs<RecordType>(response.Item, this.typeGuard);
        return response.Item;
      },
      async (): Promise<RecordType | null> => {
        return null;
      }
    );
  };
  readonly deleteRecord = async (hashKey: string): Promise<void> => {
    return await awsCommand(
      async (): Promise<void> => {
        const deleteItemInput: AWS.DynamoDB.DocumentClient.DeleteItemInput = {
          Key: {
            hashKey: hashKey,
          },
          TableName: this.tableName,
          ConditionExpression: 'attribute_exists(hashKey)',
        };

        await dynamoDocClient.delete(deleteItemInput).promise();
        Log.info(`Item ${hashKey} was successfully deleted`);
      },
      async (err: AWSError): Promise<void | null> => {
        if (err.code === 'ResourceNotFoundException') {
          Log.error(`Item ${hashKey} not found`);
          return;
        }
        return null;
      }
    );
  };
  readonly cleanup = async (): Promise<void> => {
    // TODO: implement, create table here
    throw new Error('Not implemented');
  };
}
