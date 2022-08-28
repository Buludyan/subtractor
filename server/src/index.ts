import {SQS} from './aws-services/sqs';
import {S3Bucket} from './aws-services/s3-bucket';
import {KeyValueStore} from './aws-services/dynamo-db';
import {urlToHttpOptions} from 'url';
import * as Constants from './project-specific-constants';
import {type} from 'os';
import {
  archiveSourceCodeAndGetPath,
  sleep,
  throwIfNull,
  throwIfUndefined,
  TypeGuardOf,
} from './utilities/common-utils';
import {
  IVideoName,
  videoNameTypeGuard,
  newVideoName,
} from './project-specific-interfaces';
import {ApiGateway} from './aws-services/api-gateway';
import {Log} from './utilities/log';
import {Lambda} from './aws-services/lambda';
import {plusLambdaHandler} from './lambdasHandlers/simple-plus-lambda';

Log.info(`Compilation passed successfully!`);

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

const apiPlusLambdaDeployExample = async () => {
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
  const lambdaArn = await lambda.getArn();
  throwIfNull(lambdaArn);
  const apiGateway = new ApiGateway('subtractor');
  await apiGateway.construct();
  const upload = await apiGateway.createNewResource(
    'upload',
    lambdaArn,
    'POST'
  );
  const download = await apiGateway.createNewResource(
    'download',
    lambdaArn,
    'POST'
  );
  const apiUrl = await apiGateway.createDeployment();
  Log.info(`apiUrl = ${apiUrl}`);
  const msecs = 60000;
  Log.info(`Waiting for ${msecs} msecs`);
  await sleep(msecs);
  Log.info(`Waiting for another ${msecs} msecs`);
  await sleep(msecs);
  Log.info(`Waiting for another ${msecs} msecs`);
  await sleep(msecs);
  Log.info(`Waiting for another ${msecs} msecs`);
  await sleep(msecs);
  Log.info(`Waiting for another ${msecs} msecs`);
  await sleep(msecs);
  Log.info(`Done`);
  await lambda.destroy();
  await apiGateway.destroy();
};

const main = async () => {
  await apiPlusLambdaDeployExample();
};

main().catch(err => Log.error(`Something bad happened: ${err}`));
