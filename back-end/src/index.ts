import {BackEndTranscribeInvokeLambda} from './lambdasHandlers/transcribe-invoke-lambda';
import {BackEndNameResponseLambda} from './lambdasHandlers/name-response-lambda';
import {CoreS3Bucket} from 'core';
import {CoreDynamoDb} from 'core';
import {CoreCommonUtils} from 'core';
import {InterfacesProjectSpecificInterfaces} from 'interfaces';
import {InterfacesProjectSpecificConstants} from 'interfaces';
import {CoreApiGateway} from 'core';
import {CoreLog} from 'core';
import {CoreLambda} from 'core';
import {BackEndSimplePlusLambda} from './lambdasHandlers/simple-plus-lambda';

import sleep = CoreCommonUtils.sleep;
import archiveSourceCodeAndGetPath = CoreCommonUtils.archiveSourceCodeAndGetPath;
import throwIfNull = CoreCommonUtils.throwIfNull;
import nameLambdaHandler = BackEndNameResponseLambda.nameLambdaHandler;
import transcribeLambdaHandler = BackEndTranscribeInvokeLambda.transcribeLambdaHandler;
import log = CoreLog.log;
import KeyValueStore = CoreDynamoDb.KeyValueStore;
import IVideoName = InterfacesProjectSpecificInterfaces.IVideoName;
import videoNameTypeGuard = InterfacesProjectSpecificInterfaces.videoNameTypeGuard;
import newVideoName = InterfacesProjectSpecificInterfaces.newVideoName;
import hashTovideoDynamoTableName = InterfacesProjectSpecificConstants.hashTovideoDynamoTableName;
import lambdaZipFileS3BucketName = InterfacesProjectSpecificConstants.lambdaZipFileS3BucketName;
import transcribeOutputBucketName = InterfacesProjectSpecificConstants.transcribeOutputBucketName;
import S3Bucket = CoreS3Bucket.S3Bucket;
import Lambda = CoreLambda.Lambda;
import plusLambdaHandler = BackEndSimplePlusLambda.plusLambdaHandler;
import ApiGateway = CoreApiGateway.ApiGateway;

log.info(`Compilation passed successfully!`);

const dynamoDbExample = async () => {
  const myTable = new KeyValueStore<IVideoName>(
    hashTovideoDynamoTableName,
    videoNameTypeGuard
  );
  await myTable.construct();
  await sleep(5000);
  await myTable.putRecord('a', newVideoName('v1.mp4'));
  await myTable.updateRecord('a', newVideoName('v2.mp4'));
  /*   await myTable.putRecord('b', newVideoName('v2.mp4'));
  await myTable.putRecord('c', newVideoName('v3.mp4'));
  await myTable.putRecord('d', newVideoName('v4.mp4'));
  const item = await myTable.getRecord('d');
  item.videoName = 'v5.mp4';
  await myTable.putRecord('d*', item); */

  await sleep(30000);
  await myTable.destroy();
};

//dynamoDbExample();

const lambdaDeployExample = async () => {
  const s3Bucket: S3Bucket = new S3Bucket(lambdaZipFileS3BucketName);
  await s3Bucket.construct();
  const lambdaZipFilePath = await archiveSourceCodeAndGetPath();
  await s3Bucket.sendFile(
    lambdaZipFilePath,
    lambdaZipFilePath,
    'application/zip'
  );
  const lambda: Lambda = new Lambda(
    `my-custom-lambda`,
    lambdaZipFileS3BucketName,
    lambdaZipFilePath,
    plusLambdaHandler,
    10
  );
  await lambda.construct();
  await sleep(60000);
  await lambda.destroy();
};

/* const apiPlusLambdaDeployExample = async () => {
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
  log.info(`apiUrl = ${apiUrl}`);
  const msecs = 60000;
  log.info(`Waiting for ${msecs} msecs`);
  await sleep(msecs);
  log.info(`Waiting for another ${msecs} msecs`);
  await sleep(msecs);
  log.info(`Waiting for another ${msecs} msecs`);
  await sleep(msecs);
  log.info(`Waiting for another ${msecs} msecs`);
  await sleep(msecs);
  log.info(`Waiting for another ${msecs} msecs`);
  await sleep(msecs);
  log.info(`Done`);
  await lambda.destroy();
  await apiGateway.destroy();
}; */

const createApiLabmdaDynamo = async () => {
  const s3Bucket: S3Bucket = new S3Bucket(lambdaZipFileS3BucketName);
  await s3Bucket.construct();
  const lambdaZipFilePath = await archiveSourceCodeAndGetPath();
  await s3Bucket.sendFile(
    lambdaZipFilePath,
    lambdaZipFilePath,
    'application/zip'
  );

  const lambda: Lambda = new Lambda(
    `my-custom-lambda`,
    lambdaZipFileS3BucketName,
    lambdaZipFilePath,
    nameLambdaHandler,
    10
  );
  await lambda.construct();
  const lambdaArn = await lambda.getArn();
  throwIfNull(lambdaArn);

  const apiGateway = new ApiGateway('subtractor');
  await apiGateway.construct();
  await apiGateway.createNewResource('upload', lambdaArn, 'POST');
  const apiUrl = await apiGateway.createDeployment();

  const myTable = new KeyValueStore<IVideoName>(
    hashTovideoDynamoTableName,
    videoNameTypeGuard
  );
  await myTable.construct();

  console.log(apiUrl);
  await sleep(600000);
  await lambda.destroy();
  await apiGateway.destroy();
  await myTable.destroy();
};

//createApiLabmdaDynamo();

const transcribeInvoker = async () => {
  const s3Bucket: S3Bucket = new S3Bucket(lambdaZipFileS3BucketName);
  await s3Bucket.construct();
  const lambdaZipFilePath = await archiveSourceCodeAndGetPath();
  await s3Bucket.sendFile(
    lambdaZipFilePath,
    lambdaZipFilePath,
    'application/zip'
  );

  const transcribeOutputBucket: S3Bucket = new S3Bucket(
    transcribeOutputBucketName
  );
  await transcribeOutputBucket.construct();

  const lambda: Lambda = new Lambda(
    `my-custom-lambda`,
    lambdaZipFileS3BucketName,
    lambdaZipFilePath,
    transcribeLambdaHandler,
    60
  );
  await lambda.construct();
  const lambdaArn = await lambda.getArn();
  throwIfNull(lambdaArn);

  const apiGateway = new ApiGateway('subtractor');
  await apiGateway.construct();
  await apiGateway.createNewResource('process', lambdaArn, 'POST');
  const apiUrl = await apiGateway.createDeployment();

  console.log(apiUrl);
  await sleep(600000);
  await lambda.destroy();
  await apiGateway.destroy();
  await transcribeOutputBucket.destroy();
};
transcribeInvoker();
