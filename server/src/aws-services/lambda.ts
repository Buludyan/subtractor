import * as AWS from 'aws-sdk';
import {awsCommand} from './aws-common-utils';
import {
  IGuard,
  isNotNull,
  isNotUndefined,
  isUndefined,
  makeSureThatXIs,
  throwIfNull,
  throwIfUndefined,
  TypeGuardOf,
} from '../utilities/common-utils';
import {Log} from '../utilities/log';

const lambdaClient: AWS.Lambda = new AWS.Lambda({
  apiVersion: '2015-03-31',
  region: 'eu-central-1',
});

export class Lambda {
  constructor(
    private functionName: string,
    private s3BucketName: string,
    private codeBaseZipName: string,
    private handlerName: string
  ) {}

  readonly construct = async (): Promise<void> => {
    Log.info(`Constructing Lambda ${this.functionName}`);
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
          FunctionName: this.functionName,
          Handler: this.handlerName,
          MemorySize: 128,
          PackageType: 'Zip',
          Publish: true,
          Role: 'arn:aws:iam::642813027215:role/AwsLambdaLevon',
          Runtime: 'nodejs16.x',
          Timeout: 1,
        };
        await lambdaClient.createFunction(createFunctionRequest).promise();
        Log.info(`Lambda ${this.functionName} constructed`);
        const arn = await this.getArn();
        throwIfNull(arn);
        Log.info(
          `Granting InvokdeFunction permission to lambda ${this.functionName}`
        );
        const addPermisionRequest: AWS.Lambda.Types.AddPermissionRequest = {
          Action: 'lambda:InvokeFunction',
          Principal: 'apigateway.amazonaws.com',
          FunctionName: arn,
          StatementId: 'lambdaApiGatewayAddInvokeFunctionPermission',
        };
        await lambdaClient.addPermission(addPermisionRequest).promise();
        Log.info(
          `Permission InvokdeFunction granted to lambda ${this.functionName}`
        );
      },
      async err => {
        if (err.code === 'ResourceConflictException') {
          Log.info(
            `Lambda ${this.functionName} is already constructed, skipping construction. Make sure, that lambda is deleted, is you want to update it's source code.`
          );
          return;
        }
        return null;
      }
    );
  };
  readonly destroy = async (): Promise<void> => {
    Log.info(`Destroying Lambda ${this.functionName} ARN`);
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

  readonly getArn = async (): Promise<string | null> => {
    Log.info(`Getting Lambda ${this.functionName} ARN`);
    const arn = await awsCommand(
      async () => {
        const getFunctionParams: AWS.Lambda.Types.GetFunctionRequest = {
          FunctionName: this.functionName,
        };

        const data = await lambdaClient
          .getFunction(getFunctionParams)
          .promise();
        throwIfUndefined(data.Configuration);
        Log.info(
          `Lambda ${this.functionName} ARN got: ${JSON.stringify(
            data.Configuration.FunctionArn
          )}`
        );
        return data.Configuration.FunctionArn;
      },
      async err => {
        if (err.code === `ResourceNotFoundException`) {
          return undefined;
        }
        return null;
      }
    );
    return arn ?? null;
  };
  readonly setTag = async (tags: {[key: string]: string}) => {
    Log.info(
      `Adding tags ${JSON.stringify(tags)} to Lambda ${this.functionName}`
    );

    return await awsCommand(
      async () => {
        const lambdaArn = await this.getArn();
        throwIfNull(lambdaArn);
        const tagResourceReq: AWS.Lambda.Types.TagResourceRequest = {
          Resource: lambdaArn,
          Tags: {
            ...tags,
          },
        };
        await lambdaClient.tagResource().promise();
        Log.info(
          `Tags ${JSON.stringify(tags)} set to Lambda ${this.functionName}`
        );
      },
      async err => {
        if (err.code === 'ResourceConflictException') {
          Log.info(
            `The lambda ${this.functionName} tags ${JSON.stringify(
              tags
            )} already exists, or another operation is in progress`
          );
          return;
        }
        return null;
      }
    );
  };
  readonly getTag = async (tagName: string) => {
    return await awsCommand(
      async () => {
        const lambdaARN = await this.getArn();
        throwIfNull(lambdaARN);
        Log.info(`Getting tags from Lambda ${lambdaARN}`);
        const data = await lambdaClient
          .listTags({Resource: lambdaARN})
          .promise();
        throwIfUndefined(data.Tags);
        Log.info(
          `Got tag from Lambda ${lambdaARN}. ${tagName}=${data.Tags[tagName]}`
        );
        return data.Tags[tagName];
      },
      async err => {
        return null;
      }
    );
  };

  readonly setEventSourceMappingArnInTags = async (
    eventSourceMappingArn: string
  ) => {
    Log.info(
      `Adding event source mapping arn in Lambda ${this.functionName} tags`
    );
    await this.setTag({eventSourceMappingArn: eventSourceMappingArn});
  };
  readonly getEventSourceMappingArnInTags = async () => {
    Log.info(
      `Getting event source mapping arn from Lambda ${this.functionName} tags`
    );
    return await this.getTag('eventSourceMappingArn');
  };
}
