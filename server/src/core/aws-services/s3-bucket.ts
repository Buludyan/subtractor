import {log} from './../utilities/log';
import * as AWS from 'aws-sdk';
import {AWSError} from 'aws-sdk/lib/error';
import * as awsCommonUtils from './aws-common-utils';
import {createReadStream, readFileSync} from 'fs';

const s3Client: AWS.S3 = new AWS.S3({
  apiVersion: '2006-03-01',
  region: 'eu-central-1',
});

export class S3Bucket {
  constructor(private bucketName: string) {}

  readonly construct = async () => {
    log.info(`Constructing S3 bucket ${this.bucketName}`);
    return await awsCommonUtils.awsCommand(
      async (): Promise<void> => {
        // TODO: check other parameters
        await s3Client.createBucket({Bucket: this.bucketName}).promise();
        log.info(`S3 bucket constructed ${this.bucketName}`);
      },
      async (err: AWSError): Promise<void | null> => {
        if (err.code === 'BucketAlreadyOwnedByYou') {
          log.error(
            `Bucket ${this.bucketName} already owned by you, skipping creation.`
          );
          return;
        }
        return null;
      }
    );
  };
  readonly destroy = async () => {
    log.info(`Destroying s3 bucket ${this.bucketName}`);
    return await awsCommonUtils.awsCommand(
      async (): Promise<void> => {
        // TODO: check other parameters
        await s3Client.deleteBucket({Bucket: this.bucketName}).promise();
        log.info(`S3 bucket destroyed ${this.bucketName}`);
      },
      async (err: AWSError): Promise<void | null> => {
        if (err.code === 'NoSuchBucket') {
          log.error(
            `Bucket ${this.bucketName} does not exist, nothing to delete!`
          );
          return;
        }
        return null;
      }
    );
  };

  readonly sendFile = async (
    fileName: string,
    filePath: string,
    contentType: string
  ): Promise<void> => {
    log.info(`Sending file ${fileName} to s3 bucket ${this.bucketName}`);
    return await awsCommonUtils.awsCommand(
      async (): Promise<void> => {
        const fileBody = createReadStream(filePath);
        const putObjectReq: AWS.S3.PutObjectRequest = {
          Bucket: this.bucketName,
          Key: fileName,
          Body: fileBody,
          ContentType: contentType,
        };
        await s3Client.putObject(putObjectReq).promise();

        log.info(`File sent ${fileName} to s3 bucket ${this.bucketName}`);
      },
      async (): Promise<void | null> => {
        return null;
      }
    );
  };
  readonly getFile = async (fileName: string): Promise<string | null> => {
    log.info(`Getting file ${fileName} from S3 bucket ${this.bucketName}`);
    return await awsCommonUtils.awsCommand(
      async (): Promise<string> => {
        // TODO: check other parameters
        const getObjectReq: AWS.S3.GetObjectRequest = {
          Bucket: this.bucketName,
          Key: fileName,
        };
        const response = await s3Client.getObject(getObjectReq).promise();
        log.info(`File ${fileName} got from S3 bucket ${this.bucketName}`);
        // TODO: refine this
        return response.Body as string;
      },
      async (): Promise<string | null> => {
        return null;
      }
    );
  };
  readonly getArn = async (): Promise<string> => {
    return `arn:aws:s3:::${this.bucketName}`;
  };
}
