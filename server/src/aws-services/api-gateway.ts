import * as AWS from 'aws-sdk';
import {ResourceGroups} from 'aws-sdk';
import {
  isNotNull,
  isNull,
  isUndefined,
  throwIfNull,
  throwIfUndefined,
} from '../utilities/common-utils';
import {log, Log} from '../utilities/log';
import {awsCommand} from './aws-common-utils';
const awsRegion = 'eu-central-1';
const apiGatewayClient: AWS.APIGateway = new AWS.APIGateway({
  apiVersion: '2015-07-09',
  region: awsRegion,
});

interface Resource {
  id: string;
  parentId: string | null;
  path: string | null;
  restApiId: string;
}

export class ApiGateway {
  id: string | null = null;
  constructor(private apiName: string) {}

  private readonly getId = async (): Promise<string | null> => {
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
        log.info(`Api ${this.apiName} ID is retrieved`);
        return restApi.id;
      },
      async (): Promise<string | null> => {
        return null;
      }
    );
  };

  private readonly getResources = async (): Promise<Resource[]> => {
    return await awsCommand(
      async (): Promise<Resource[]> => {
        if (isNull(this.id)) {
          const id = await this.getId();
          if (isNull(id)) {
            const errorMessage = `There is no restApi with name ${this.apiName}`;
            log.throw(errorMessage);
          }
          this.id = id;
        }
        throwIfNull(this.id);
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

  private readonly getRootResourceId = async (): Promise<string> => {
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
        log.info(`Api ${this.apiName} is created`);
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
            log.info(`There is no restApi with name ${this.apiName}`);
            return;
          }
          this.id = id;
        }

        const deleteRestAPIReq: AWS.APIGateway.DeleteRestApiRequest = {
          restApiId: this.id,
        };

        await apiGatewayClient.deleteRestApi(deleteRestAPIReq).promise();
        this.id = null;
        log.info(`Api ${this.apiName} has deleted`);
      },
      async (): Promise<void | null> => {
        return null;
      }
    );
  };

  readonly createNewResource = async (
    resourceName: string,
    lambdaArn: string,
    method: 'GET' | 'POST'
  ): Promise<Resource> => {
    const resource = await this.createResource(resourceName);
    await this.putMethod(resource, method);
    await this.putMethodResponse(resource, method);
    await this.putIntegration(resource, lambdaArn, method);
    await this.putIntegrationResponse(resource, method);
    return resource;
  };

  private readonly createResource = async (
    resourceName: string
  ): Promise<Resource> => {
    log.info(`Creating resource ${resourceName}`);
    return await awsCommand(
      async (): Promise<Resource> => {
        if (isNull(this.id)) {
          const id = await this.getId();
          throwIfNull(id, `There is no restApi with name ${this.apiName}`);
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
        throwIfUndefined(data.id);
        log.info(`Resource ${resourceName} creating`);
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

  readonly createDeployment = async (): Promise<string> => {
    const restApiId = await this.getId();
    throwIfNull(restApiId);
    log.info(`Creating deployment for ${restApiId}`);
    return await awsCommand(
      async (): Promise<string> => {
        const createDeploymentReq: AWS.APIGateway.CreateDeploymentRequest = {
          restApiId: restApiId,
          stageName: this.apiName,
        };
        const data = await apiGatewayClient
          .createDeployment(createDeploymentReq)
          .promise();
        log.info(
          `Deployment ${restApiId} created, data ${JSON.stringify(data)}`
        );
        return `https://${restApiId}.execute-api.${awsRegion}.amazonaws.com/${this.apiName}`;
      },
      async (): Promise<string | null> => {
        return null;
      }
    );
  };

  private readonly deleteResource = async (
    resource: Resource
  ): Promise<void> => {
    return await awsCommand(
      async (): Promise<void> => {
        const deleteResourceReq: AWS.APIGateway.DeleteResourceRequest = {
          restApiId: resource.restApiId,
          resourceId: resource.id,
        };

        await apiGatewayClient.deleteResource(deleteResourceReq).promise();
        log.info(`Resource for ${this.apiName} has deleted`);
      },
      async (): Promise<void | null> => {
        return null;
      }
    );
  };
  private readonly putMethod = async (
    resource: Resource,
    method: 'POST' | 'GET'
  ): Promise<void> => {
    log.info(`Adding method ${method} for resource ${resource.id}`);
    return await awsCommand(
      async (): Promise<void> => {
        const putMethodReq: AWS.APIGateway.PutMethodRequest = {
          authorizationType: 'NONE',
          httpMethod: method,
          resourceId: resource.id,
          restApiId: resource.restApiId,
        };
        await apiGatewayClient.putMethod(putMethodReq).promise();
        log.info(`Method ${method} for resource ${resource.id} has added`);
      },
      async (): Promise<void | null> => {
        return null;
      }
    );
  };
  private readonly putIntegration = async (
    resource: Resource,
    lambdaArn: string,
    httpMethod: 'POST' | 'GET'
  ): Promise<void> => {
    log.info(`Adding integration for resource ${resource.id}`);
    return await awsCommand(
      async (): Promise<void> => {
        const uri = `arn:aws:apigateway:${awsRegion}:lambda:path/2015-03-31/functions/${lambdaArn}/invocations`;
        log.info(`URI is ${uri}`);
        const putIntegrationReq: AWS.APIGateway.PutIntegrationRequest = {
          httpMethod: httpMethod,
          restApiId: resource.restApiId,
          resourceId: resource.id,
          integrationHttpMethod: httpMethod,
          type: 'AWS_PROXY',
          uri: uri,
        };
        await apiGatewayClient.putIntegration(putIntegrationReq).promise();
        log.info(`Integration for resource ${resource.id} has added`);
      },
      async (): Promise<void | null> => {
        return null;
      }
    );
  };
  private readonly putIntegrationResponse = async (
    resource: Resource,
    httpMethod: 'POST' | 'GET'
  ): Promise<void> => {
    log.info(`Adding integration responce for resource ${resource.id}`);
    return await awsCommand(
      async (): Promise<void> => {
        const putIntegrationResponseReq: AWS.APIGateway.PutIntegrationResponseRequest =
          {
            httpMethod: httpMethod,
            restApiId: resource.restApiId,
            resourceId: resource.id,
            statusCode: '200',
          };
        await apiGatewayClient
          .putIntegrationResponse(putIntegrationResponseReq)
          .promise();
        log.info(`Integration response for resource ${resource.id} has added`);
      },
      async (): Promise<void | null> => {
        return null;
      }
    );
  };
  private readonly putMethodResponse = async (
    resource: Resource,
    httpMethod: 'POST' | 'GET'
  ): Promise<void> => {
    log.info(`Adding method response for resource ${resource.id}`);
    return await awsCommand(
      async (): Promise<void> => {
        const putMethodResponseReq: AWS.APIGateway.PutMethodResponseRequest = {
          httpMethod: httpMethod,
          restApiId: resource.restApiId,
          resourceId: resource.id,
          statusCode: '200',
          responseModels: {'application/json': 'Empty'},
        };
        await apiGatewayClient
          .putMethodResponse(putMethodResponseReq)
          .promise();
        log.info(`Method response for resource ${resource.id} has added`);
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
