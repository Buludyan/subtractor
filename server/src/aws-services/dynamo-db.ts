import {AWSError} from 'aws-sdk/lib/error';
import * as AWS from 'aws-sdk';
import {callAws} from './aws-common-utils';

const dynamoClient: AWS.DynamoDB = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region: 'us-east-1',
});

export class KeyValueStore<RecordType extends {hashKey: string}> {
  constructor(private tableName: string) {}

  readonly deploy = async (): Promise<void> => {
    return await callAws(
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
        console.log(`Table ${this.tableName} is created`);
      },
      async (err: AWSError): Promise<void | null> => {
        if (err.code === 'ResourceInUseException') {
          console.log(`Table ${this.tableName} is already created`);
          return;
        }
        return null;
      }
    );
  };
  readonly undeploy = async (): Promise<void> => {
    return await callAws(
      async (): Promise<void> => {
        const deleteTableReq: AWS.DynamoDB.Types.DeleteTableInput = {
          TableName: this.tableName,
        };

        await dynamoClient.deleteTable(deleteTableReq).promise();
        console.log(`Table ${this.tableName} is deleted`);
      },
      async (err: AWSError): Promise<void | null> => {
        if (err.code === 'ResourceNotFoundException') {
          console.log(`Table ${this.tableName} is not found`);
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
    // TODO: implement, create table here
    throw new Error(`Not implemented`);
  };
  readonly getRecord = async (hashKey: string): Promise<RecordType> => {
    // TODO: implement, create table here
    throw new Error(`Not implemented`);
  };
  readonly deleteRecord = async (hashKey: string): Promise<RecordType> => {
    // TODO: implement, create table here
    throw new Error(`Not implemented`);
  };
  readonly purge = async (): Promise<void> => {
    // TODO: implement, create table here
    throw new Error(`Not implemented`);
  };
}
