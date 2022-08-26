import * as AWS from 'aws-sdk';
import {ResourceGroups} from 'aws-sdk';
import {
  isNotNull,
  isNull,
  isUndefined,
  throwIfUndefined,
} from '../utilities/common-utils';
import {Log} from '../utilities/log';
import {awsCommand} from './aws-common-utils';

const apiGatewayClient: AWS.APIGateway = new AWS.APIGateway({
  apiVersion: '2015-07-09',
  region: 'eu-central-1',
});

interface Resource {
  id: string;
  parentId: string | null;
  path: string | null;
  restApiId: string;
}

export class ApiGate {
  id: string | null = null;
  constructor(private apiName: string) {}

  readonly getId = async (): Promise<string | null> => {
    return await awsCommand(
      async (): Promise<string | null> => {
        const getRestAPIsReq: AWS.APIGateway.GetRestApisRequest = {};
        const data = await apiGatewayClient
          .getRestApis(getRestAPIsReq)
          .promise();
        throwIfUndefined(data.items);
        const restApi = data.items.find(e => e.name === this.apiName);
        if (isUndefined(restApi)) {
          return null;
        }
        throwIfUndefined(restApi.id);
        Log.info(`Api ${this.apiName} ID is retrieved`);
        return restApi.id;
      },
      async (): Promise<string | null> => {
        return null;
      }
    );
  };

  readonly getResources = async (): Promise<Resource[]> => {
    return await awsCommand(
      async (): Promise<Resource[]> => {
        if (isNull(this.id)) {
          const id = await this.getId();
          if (isNull(id)) {
            const errorMessage = `There is no restApi with name ${this.apiName}`;
            Log.error(errorMessage);
            throw new Error(errorMessage);
          }
          this.id = id;
        }
        const getResourcesReq: AWS.APIGateway.GetResourcesRequest = {
          restApiId: this.id,
        };
        const data = await apiGatewayClient
          .getResources(getResourcesReq)
          .promise();
        throwIfUndefined(data.items);
        const restApiId = this.id;
        return data.items.map((e): Resource => {
          throwIfUndefined(e.id);
          return {
            id: e.id,
            parentId: e.parentId ?? null,
            path: e.path ?? null,
            restApiId: restApiId,
          };
        });
      },
      async (): Promise<Resource[] | null> => {
        return null;
      }
    );
  };

  readonly getRootResourceId = async (): Promise<string> => {
    const resources = await this.getResources();
    const rootResource = resources.find(e => e.path === '/');
    throwIfUndefined(rootResource);
    return rootResource.id;
  };

  readonly construct = async (): Promise<void> => {
    return await awsCommand(
      async (): Promise<void> => {
        if (isNotNull(this.id)) {
          return;
        }

        const createRestAPIReq: AWS.APIGateway.CreateRestApiRequest = {
          name: this.apiName,
        };
        const data = await apiGatewayClient
          .createRestApi(createRestAPIReq)
          .promise();
        throwIfUndefined(data.id);
        this.id = data.id;
        Log.info(`Api ${this.apiName} is created`);
      },
      async (): Promise<void | null> => {
        return null;
      }
    );
  };
  readonly destroy = async (): Promise<void> => {
    return await awsCommand(
      async (): Promise<void> => {
        if (isNull(this.id)) {
          const id = await this.getId();
          if (isNull(id)) {
            Log.info(`There is no restApi with name ${this.apiName}`);
            return;
          }
          this.id = id;
        }

        const deleteRestAPIReq: AWS.APIGateway.DeleteRestApiRequest = {
          restApiId: this.id,
        };

        await apiGatewayClient.deleteRestApi(deleteRestAPIReq).promise();
        this.id = null;
        Log.info(`Api ${this.apiName} has deleted`);
      },
      async (): Promise<void | null> => {
        return null;
      }
    );
  };

  readonly createResource = async (resourceName: string): Promise<Resource> => {
    return await awsCommand(
      async (): Promise<Resource> => {
        if (isNull(this.id)) {
          const id = await this.getId();
          if (isNull(id)) {
            const errorMessage = `There is no restApi with name ${this.apiName}`;
            Log.error(errorMessage);
            throw new Error(errorMessage);
          }
          this.id = id;
        }

        const createResourceReq: AWS.APIGateway.CreateResourceRequest = {
          restApiId: this.id,
          parentId: await this.getRootResourceId(),
          pathPart: resourceName,
        };

        const data = await apiGatewayClient
          .createResource(createResourceReq)
          .promise();
        Log.info(`Resource for ${this.apiName} is created`);
        throwIfUndefined(data.id);
        return {
          id: data.id,
          parentId: data.parentId ?? null,
          path: data.path ?? null,
          restApiId: this.id,
        };
      },
      async (): Promise<Resource | null> => {
        return null;
      }
    );
  };
  readonly deleteResource = async (resource: Resource): Promise<void> => {
    return await awsCommand(
      async (): Promise<void> => {
        const deleteResourceReq: AWS.APIGateway.DeleteResourceRequest = {
          restApiId: resource.restApiId,
          resourceId: resource.id,
        };

        await apiGatewayClient.deleteResource(deleteResourceReq).promise();
        Log.info(`Resource for ${this.apiName} has deleted`);
      },
      async (): Promise<void | null> => {
        return null;
      }
    );
  };

  static readonly destroyAll = async (): Promise<void> => {
    // TODO: implement
  };
}
