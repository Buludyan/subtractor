import * as AWS from 'aws-sdk';
import {awsCommand} from './aws-common-utils';
import {IGuard, makeSureThatXIs, TypeGuardOf} from '../utilities/common-utils';

const lambdaClient: AWS.Lambda = new AWS.Lambda({
  apiVersion: '2015-03-31',
  region: 'us-east-1',
});

export class Lambda {
  constructor(
    private functionName: string,
    private s3BucketName: string,
    private codeBaseZipName: string,
    private handlerName: string
  ) {}

  readonly construct = async (): Promise<void> => {
    return awsCommand(
      async () => {
        const createFunctionRequest: AWS.Lambda.Types.CreateFunctionRequest = {
          Code: {
            S3Bucket: this.s3BucketName,
            S3Key: this.codeBaseZipName,
          },
          // Environment: {
          //    Variables: {
          //       string : string
          //    }
          // },
          // EphemeralStorage: {
          //    Size: number
          // },
          FunctionName: this.functionName,
          Handler: this.handlerName,
          MemorySize: 128,
          PackageType: 'Zip',
          Publish: true,
          Role: 'string',
          Runtime: 'nodejs16.x',
          // Tags: {
          //    string : string
          // },
          Timeout: 1,
        };
        await lambdaClient.createFunction(createFunctionRequest).promise();
      },
      async () => {
        return null;
      }
    );
  };
  readonly destroy = async (): Promise<void> => {
    return awsCommand(
      async () => {
        const deleteFunctionRequest: AWS.Lambda.Types.DeleteFunctionRequest = {
          FunctionName: this.functionName,
        };
        await lambdaClient.deleteFunction(deleteFunctionRequest).promise();
      },
      async () => {
        return null;
      }
    );
  };
}
