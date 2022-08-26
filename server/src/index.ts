import {SQS} from './aws-services/sqs';
import {S3Bucket} from './aws-services/s3-bucket';
import {KeyValueStore} from './aws-services/dynamo-db';
import {urlToHttpOptions} from 'url';
import * as Constants from './project-specific-constants';
import {type} from 'os';
import {sleep, TypeGuardOf} from './utilities/common-utils';
import {
  IVideoName,
  videoNameTypeGuard,
  newVideoName,
} from './project-specific-interfaces';
import {ApiGate} from './aws-services/api-gateway';
import {Log} from './utilities/log';

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

const main = async () => {
  // const mySqs = new SQS("MyNewSQS1");
  // await mySqs.construct();
  // await work();
  // await mySqs.destroy();
  // const myBucket = new S3Bucket("my-bucket-for-levon-arman");
  // await myBucket.construct();
  // await myBucket.destroy();
  // const myTable = new KeyValueStore(Constants.tableName);
  // await myTable.construct();
  // await myTable.putRecord('12345', {videoName: 'name'});
  // await myTable.destroy();
  // await archiveSourceCodeAndGetPath();
};

main().catch(err => Log.error(`Something bad happened: ${err}`));
