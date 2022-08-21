import * as AWS from 'aws-sdk';
import {AWSError} from 'aws-sdk/lib/error';
import * as awsCommonUtils from './aws-common-utils';

const s3Client: AWS.S3 = new AWS.S3({
  apiVersion: '2006-03-01',
  region: 'us-east-1',
});

export class S3Bucket {
  constructor(private bucketName: string) {}

  readonly construct = async () => {
    return await awsCommonUtils.awsCommand(
      async (): Promise<void> => {
        // TODO: check other parameters
        await s3Client.createBucket({Bucket: this.bucketName}).promise();
      },
      async (err: AWSError): Promise<void | null> => {
        if (err.code === `BucketAlreadyOwnedByYou`) {
          console.log(
            `Bucket ${this.bucketName} already owned by you, skipping creation.`
          );
          return;
        }
        console.log('Error', err);
        return null;
      }
    );
  };
  readonly destroy = async () => {
    return await awsCommonUtils.awsCommand(
      async (): Promise<void> => {
        // TODO: check other parameters
        await s3Client.deleteBucket({Bucket: this.bucketName}).promise();
      },
      async (err: AWSError): Promise<void | null> => {
        if (err.code === `NoSuchBucket`) {
          console.log(
            `Bucket ${this.bucketName} does not exist, nothing to delete!`
          );
          return;
        }
        console.log('Error', err);
        return null;
      }
    );
  };
  readonly sendFile = async (
    fileName: string,
    fileContent: string
  ): Promise<void> => {
    return await awsCommonUtils.awsCommand(
      async (): Promise<void> => {
        // TODO: check other parameters
        const putObjectReq: AWS.S3.PutObjectRequest = {
          Bucket: this.bucketName,
          Key: fileName,
          Body: fileContent,
        };
        await s3Client.putObject(putObjectReq).promise();
      },
      async (err: AWSError): Promise<void | null> => {
        console.log('Error', err);
        return null;
      }
    );
  };
  readonly getFile = async (fileName: string): Promise<string | null> => {
    return await awsCommonUtils.awsCommand(
      async (): Promise<string> => {
        // TODO: check other parameters
        const getObjectReq: AWS.S3.GetObjectRequest = {
          Bucket: this.bucketName,
          Key: fileName,
        };
        const response = await s3Client.getObject(getObjectReq).promise();
        // TODO: refine this
        return response.Body as string;
      },
      async (err: AWSError): Promise<string | null> => {
        console.log('Error', err);
        return null;
      }
    );
  };
}
