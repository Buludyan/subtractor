import * as AWS from 'aws-sdk';
import { AWSError } from 'aws-sdk/lib/error';
import * as Utils from './common-utils';
import { callAws } from './aws-common-utils';

const apiGatewayClient: AWS.APIGateway = new AWS.APIGateway({
    apiVersion: "2012-08-10",
    region: "us-east-1",
});

export class ApiGate
{
    constructor () {}

    readonly deploy = async () : Promise<void> => {
        // TODO: implement, create table here
        throw new Error(`Not implemented`);
    }
    readonly undeploy = async () : Promise<void> => {
        // TODO: implement, delete table here
        throw new Error(`Not implemented`);
    }
}