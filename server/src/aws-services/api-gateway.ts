import * as AWS from 'aws-sdk';
import {awsCommand} from './aws-common-utils';

const apiGatewayClient: AWS.APIGateway = new AWS.APIGateway({
  apiVersion: '2015-07-09',
  region: 'eu-central-1',
});

export class ApiGate {
  constructor(private apiName: string) {}

  readonly construct = async (): Promise<void> => {
    return await awsCommand(
      async (): Promise<void> => {
        const createRestAPIReq: AWS.APIGateway.CreateRestApiRequest = {
          name: this.apiName,
        };

        await apiGatewayClient.createRestApi(createRestAPIReq).promise();
        console.log(`Api ${this.apiName} is created`);
      },
      async (): Promise<void | null> => {
        return null;
      }
    );
  };
  readonly destroy = async (restApiId: string): Promise<void> => {
    return await awsCommand(
      async (): Promise<void> => {
        const deleteRestAPIReq: AWS.APIGateway.DeleteRestApiRequest = {
          restApiId: restApiId,
        };

        await apiGatewayClient.deleteRestApi(deleteRestAPIReq).promise();
        console.log(`Api ${this.apiName} was deleted`);
      },
      async (): Promise<void | null> => {
        return null;
      }
    );
  };
  readonly createResource = async (
    restApiId: string,
    parentId: string,
    pathPart: string
  ): Promise<void> => {
    return await awsCommand(
      async (): Promise<void> => {
        const createResourceReq: AWS.APIGateway.CreateResourceRequest = {
          restApiId: restApiId,
          parentId: parentId,
          pathPart: pathPart,
        };

        await apiGatewayClient.createResource(createResourceReq).promise();
        console.log(`Resource for ${this.apiName} is created`);
      },
      async (): Promise<void | null> => {
        return null;
      }
    );
  };
  readonly deleteResource = async (
    restApiId: string,
    resourceId: string
  ): Promise<void> => {
    return await awsCommand(
      async (): Promise<void> => {
        const deleteResourceReq: AWS.APIGateway.DeleteResourceRequest = {
          restApiId: restApiId,
          resourceId: resourceId,
        };

        await apiGatewayClient.deleteResource(deleteResourceReq).promise();
        console.log(`Resource for ${this.apiName} was deleted`);
      },
      async (): Promise<void | null> => {
        return null;
      }
    );
  };
}
