import * as AWS from 'aws-sdk';

const apiGatewayClient: AWS.APIGateway = new AWS.APIGateway({
  apiVersion: '2012-08-10',
  region: 'us-east-1',
});

export class ApiGate {
  constructor() {}

  readonly construct = async (): Promise<void> => {
    // TODO: implement, create table here
    throw new Error(`Not implemented`);
  };
  readonly destroy = async (): Promise<void> => {
    // TODO: implement, delete table here
    throw new Error(`Not implemented`);
  };
}
