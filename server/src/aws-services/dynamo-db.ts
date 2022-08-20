import * as AWS from 'aws-sdk';

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
    readonly putRecord = async (hashKey: string, record: RecordType) : Promise<void> => {
        // TODO: implement, create table here
        throw new Error(`Not implemented`);
    }
    readonly getRecord = async (hashKey: string) : Promise<RecordType> => {
        // TODO: implement, create table here
        throw new Error(`Not implemented`);
    }
    readonly deleteRecord = async (hashKey: string) : Promise<RecordType> => {
        // TODO: implement, create table here
        throw new Error(`Not implemented`);
    }
    readonly purge = async () : Promise<void> => {
        // TODO: implement, create table here
        throw new Error(`Not implemented`);
    }
}