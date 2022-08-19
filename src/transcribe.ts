import * as AWS from 'aws-sdk';
import { AWSError } from 'aws-sdk/lib/error';
import * as Utils from './common-utils';
import { callAws } from './aws-common-utils';

const sqsClient: AWS.TranscribeService = new AWS.TranscribeService({
    apiVersion: "2017-10-26", 
    region: 'us-east-1'
});

export class SQS
{
    constructor() { }
    readonly deploy = async () : Promise<void> => {
        // TODO: implement
        throw new Error(`Not implemented`);
    }
    readonly undeploy = async () : Promise<void> => {
        // TODO: implement
        throw new Error(`Not implemented`);
    }
}