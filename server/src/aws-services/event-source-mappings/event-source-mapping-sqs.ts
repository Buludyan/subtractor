import * as AWS from 'aws-sdk';

const lambdaClient: AWS.Lambda = new AWS.Lambda({
  apiVersion: '2015-03-31',
  region: 'eu-central-1',
});

export class EventSourceMappingSQS {
  readonly arn: string | null = null;
  constructor(private queueARN: string, private lambdaName: string) {}
  readonly construct = async () => {};
  readonly destroy = async () => {};
  readonly getArn = async () => {
    return this.arn;
  };
