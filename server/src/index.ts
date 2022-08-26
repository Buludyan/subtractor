import {SQS} from './aws-services/sqs';
import {S3Bucket} from './aws-services/s3-bucket';
import {KeyValueStore} from './aws-services/dynamo-db';
import {urlToHttpOptions} from 'url';
import * as Constants from './project-specific-constants';
import {type} from 'os';
import {
  archiveSourceCodeAndGetPath,
  sleep,
  TypeGuardOf,
} from './utilities/common-utils';
import {
  IVideoName,
  videoNameTypeGuard,
  newVideoName,
} from './project-specific-interfaces';
import {ApiGate} from './aws-services/api-gateway';
import {Log} from './utilities/log';
import {Lambda} from './aws-services/lambda';
import {plusLambdaHandler} from './lambdasHandlers/simple-plus-lambda';

Log.info(`Compilation passed successfully!`);
const apiGatewayTest = async () => {
  const apiGate = new ApiGate('testApi2');
  await apiGate.construct();
  const levon = await apiGate.createResource('levon');
  const arman = await apiGate.createResource('arman');
  const rubicock = await apiGate.createResource('rubicock');
  Log.info(levon.id);
  Log.info(arman.id);
  Log.info(rubicock.id);
  await sleep(10000);
  Log.info('after 10000');
  await apiGate.deleteResource(rubicock);
  await sleep(5000);
  Log.info('after 5000');
  await apiGate.deleteResource(levon);
  await sleep(5000);
  Log.info('after 5000');
  await apiGate.deleteResource(arman);
  await sleep(5000);
  Log.info('after 5000');
  await apiGate.destroy();
};

const dynamoDbExample = async () => {
  const myTable = new KeyValueStore<IVideoName>(
    Constants.hashTovideoDynamoTableName,
    videoNameTypeGuard
  );
  await myTable.construct();
  await sleep(5000);
  await myTable.putRecord('a', newVideoName('v1.mp4'));
  await myTable.putRecord('b', newVideoName('v2.mp4'));
  await myTable.putRecord('c', newVideoName('v3.mp4'));
  await myTable.putRecord('d', newVideoName('v4.mp4'));
  const item = await myTable.getRecord('d');
  item.videoName = 'v5.mp4';
  await myTable.putRecord('d*', item);

  await sleep(30000);
  await myTable.destroy();
};

const lambdaDeployExample = async () => {
  const s3Bucket: S3Bucket = new S3Bucket(Constants.lambdaZipFileS3BucketName);
  await s3Bucket.construct();
  const lambdaZipFilePath = await archiveSourceCodeAndGetPath();
  await s3Bucket.sendFile(
    lambdaZipFilePath,
    lambdaZipFilePath,
    'application/zip'
  );
  const lambda: Lambda = new Lambda(
    `my-custom-lambda`,
    Constants.lambdaZipFileS3BucketName,
    lambdaZipFilePath,
    plusLambdaHandler
  );
  await lambda.construct();
  await sleep(60000);
  await lambda.destroy();
};

const main = async () => {};

main().catch(err => Log.error(`Something bad happened: ${err}`));
