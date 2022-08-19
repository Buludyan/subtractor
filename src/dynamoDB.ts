import * as AWS from 'aws-sdk';
import { AWSError } from 'aws-sdk/lib/error';
import * as Utils from './common-utils';
import { callAws } from './aws-common-utils';

const dynamoClient: AWS.DynamoDB = new AWS.DynamoDB({
    apiVersion: "2012-08-10",
    region: "us-east-1",
});

export class DynamoTable<RecordType>
{
    constructor (private tableName : string) {}

    readonly deploy = async () : Promise<void> => {
        // TODO: implement, create table here
        throw new Error(`Not implemented`);
    }
    readonly undeploy = async () : Promise<void> => {
        // TODO: implement, delete table here
        throw new Error(`Not implemented`);
    }
    readonly addRecord = async (hashKey: string, record: RecordType) : Promise<void> => {
        // TODO: implement, create table here
        throw new Error(`Not implemented`);
    }
    readonly getRecord = async (hashKey: string) : Promise<RecordType> => {
        // TODO: implement, create table here
        throw new Error(`Not implemented`);
    }

}