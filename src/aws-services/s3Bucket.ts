import * as AWS from 'aws-sdk';
import { AWSError } from 'aws-sdk/lib/error';
import * as awsCommonUtils from './aws-common-utils';

const s3Client: AWS.S3 = new AWS.S3({
    apiVersion: "2006-03-01",
    region: "us-east-1",
});

export class S3Bucket
{
    constructor(private bucketName: string) {}

    readonly deploy = async () => {
        return await awsCommonUtils.callAws(
            async () : Promise<void> => {
                // TODO: check other parameters
                await s3Client.createBucket({ Bucket: this.bucketName }).promise();
            },
            async (err: AWSError) : Promise<void | null> => {
                if(err.code === `BucketAlreadyOwnedByYou`) {
                    console.log(`Bucket ${this.bucketName} already owned by you, skipping creation.`)
                    return;
                }
                console.log("Error", err);
                return null;
            }
        );
          
    }
    readonly undeploy = async () => {
        return await awsCommonUtils.callAws(
            async () : Promise<void> => {
                // TODO: check other parameters
                await s3Client.deleteBucket({ Bucket: this.bucketName }).promise();
            },
            async (err: AWSError) : Promise<void | null> => {
                if(err.code === `NoSuchBucket`) {
                    console.log(`Bucket ${this.bucketName} does not exist, nothing to delete!`);
                    return;
                }
                console.log("Error", err);
                return null;
            }
        );
    }
    readonly sendFile = async (fileName : string, fileContent : string) : Promise<void> => {
        // TODO: implement
        throw new Error(`Not implemented`);
    }
    readonly getFile = async (fileName : string) : Promise<string | null> => {
        // TODO: implement
        throw new Error(`Not implemented`);
    }
}