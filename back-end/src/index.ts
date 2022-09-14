import {BackEndTranscribeInvokeLambda} from './lambdasHandlers/transcribe-invoke-lambda';
import {BackEndNameResponseLambda} from './lambdasHandlers/name-response-lambda';
import {BackEndVideoDownloadLambda} from './lambdasHandlers/video-download-lambda';
import {CoreS3Bucket} from 'core';
import {CoreDynamoDb} from 'core';
import {CoreCommonUtils} from 'core';
//import {CoreAwsService} from 'core';
import {
  InterfacesProjectSpecificInterfaces,
  InterfacesProjectSpecificConstants,
} from 'interfaces';
import {CoreApiGateway} from 'core';
import {CoreLog} from 'core';
import {CoreLambda} from 'core';

import sleep = CoreCommonUtils.sleep;
import archiveSourceCodeAndGetPath = CoreCommonUtils.archiveSourceCodeAndGetPath;
import throwIfNull = CoreCommonUtils.throwIfNull;
import nameLambdaHandler = BackEndNameResponseLambda.nameLambdaHandler;
import transcribeLambdaHandler = BackEndTranscribeInvokeLambda.transcribeLambdaHandler;
import videoDownloadLambdaHandler = BackEndVideoDownloadLambda.videoDownloadLambdaHandler;
import log = CoreLog.log;
import KeyValueStore = CoreDynamoDb.KeyValueStore;
import IVideoName = InterfacesProjectSpecificInterfaces.IVideoName;
import videoNameTypeGuard = InterfacesProjectSpecificInterfaces.videoNameTypeGuard;
import hashToVideoDynamoTableName = InterfacesProjectSpecificConstants.hashToVideoDynamoTableName;
import lambdaZipFileS3BucketName = InterfacesProjectSpecificConstants.lambdaZipFileS3BucketName;
import transcribeOutputBucketName = InterfacesProjectSpecificConstants.transcribeOutputBucketName;
import videonameLambdaName = InterfacesProjectSpecificConstants.videonameLambdaName;
import transcribeLambdaName = InterfacesProjectSpecificConstants.transcribeLambdaName;
import downloadLambdaName = InterfacesProjectSpecificConstants.downloadLambdaName;
import videoStoreHashName = InterfacesProjectSpecificConstants.videoStoreHashName;
import apiGatewayName = InterfacesProjectSpecificConstants.apiGatewayName;
import S3Bucket = CoreS3Bucket.S3Bucket;
import Lambda = CoreLambda.Lambda;
import ApiGateway = CoreApiGateway.ApiGateway;
//import AwsService = CoreAwsService.AwsService;

log.info(`Compilation passed successfully!`);

const initiate = async () => {
  const LambdaBucket: S3Bucket = new S3Bucket(lambdaZipFileS3BucketName);
  await LambdaBucket.construct();
  const lambdaZipFilePath = await archiveSourceCodeAndGetPath();
  await LambdaBucket.sendFile(
    lambdaZipFilePath,
    lambdaZipFilePath,
    'application/zip',
    false
  );

  const nameLambda: Lambda = new Lambda(
    videonameLambdaName,
    lambdaZipFileS3BucketName,
    lambdaZipFilePath,
    nameLambdaHandler,
    60
  );
  await nameLambda.construct();
  const nameLambdaArn = await nameLambda.getArn();
  throwIfNull(nameLambdaArn);

  const transcribeLambda: Lambda = new Lambda(
    transcribeLambdaName,
    lambdaZipFileS3BucketName,
    lambdaZipFilePath,
    transcribeLambdaHandler,
    60
  );
  await transcribeLambda.construct();
  const transcribeLambdaArn = await transcribeLambda.getArn();
  throwIfNull(transcribeLambdaArn);

  const downloadLambda: Lambda = new Lambda(
    downloadLambdaName,
    lambdaZipFileS3BucketName,
    lambdaZipFilePath,
    videoDownloadLambdaHandler,
    60
  );
  await downloadLambda.construct();
  const downloadLambdaArn = await downloadLambda.getArn();
  throwIfNull(downloadLambdaArn);

  const apiGateway = new ApiGateway(apiGatewayName);
  await apiGateway.construct();
  await apiGateway.createNewResource('prepare', nameLambdaArn, 'POST');
  await apiGateway.createNewResource('process', transcribeLambdaArn, 'POST');
  await apiGateway.createNewResource('download', downloadLambdaArn, 'POST');
  const apiUrl = await apiGateway.createDeployment();

  const hashToVideoDynamoTable = new KeyValueStore<IVideoName>(
    hashToVideoDynamoTableName,
    videoNameTypeGuard
  );
  await hashToVideoDynamoTable.construct();

  const videoStoreHashBucket: S3Bucket = new S3Bucket(videoStoreHashName);
  await videoStoreHashBucket.construct();
  await videoStoreHashBucket.setCorsForPut();

  const transcribeOutputBucket: S3Bucket = new S3Bucket(
    transcribeOutputBucketName
  );
  await transcribeOutputBucket.construct();

  console.log(apiUrl);
};

const demolish = async () => {
  const LambdaBucket: S3Bucket = new S3Bucket(lambdaZipFileS3BucketName);
  await LambdaBucket.destroy();

  const nameLambda: Lambda = new Lambda(
    videonameLambdaName,
    // TODO: getRidOfParams
    '/',
    '/',
    nameLambdaHandler,
    60
  );
  await nameLambda.destroy();

  const transcribeLambda: Lambda = new Lambda(
    transcribeLambdaName,
    '/',
    '/',
    transcribeLambdaHandler,
    60
  );
  await transcribeLambda.destroy();

  const downloadLambda: Lambda = new Lambda(
    downloadLambdaName,
    '/',
    '/',
    videoDownloadLambdaHandler,
    60
  );
  await downloadLambda.destroy();

  const apiGateway = new ApiGateway(apiGatewayName);
  await apiGateway.destroy();

  const videoStoreHashBucket: S3Bucket = new S3Bucket(videoStoreHashName);
  await videoStoreHashBucket.destroy();

  const transcribeOutputBucket: S3Bucket = new S3Bucket(
    transcribeOutputBucketName
  );
  await transcribeOutputBucket.destroy();

  const hashToVideoDynamoTable = new KeyValueStore<IVideoName>(
    hashToVideoDynamoTableName,
    videoNameTypeGuard
  );
  await hashToVideoDynamoTable.destroy();
};

const main = async () => {
  //await demolish();
  await initiate();
  await sleep(100000);
  await demolish();
};

main().catch(err => log.error(`Something bad happened: ${err}`));
