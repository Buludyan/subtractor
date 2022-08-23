import {SQS} from './aws-services/sqs';
import {S3Bucket} from './aws-services/s3-bucket';
import {KeyValueStore} from './aws-services/dynamo-db';
import {urlToHttpOptions} from 'url';
import * as Constants from './project-specific-constants';
import {type} from 'os';
import {sleep} from './utilities/common-utils';
import {IVideoName, videoNameTypeGuard} from './project-specific-interfaces';
import {ApiGate} from './aws-services/api-gateway';
import {Log} from './utilities/log';

console.log(`Compilation passed successfully!`);
const apiGatewayTest = async () => {
  const apiGate = new ApiGate('testApi2');
  await apiGate.construct();
  const levon = await apiGate.createResource('levon');
  const arman = await apiGate.createResource('arman');
  const rubicock = await apiGate.createResource('rubicock');
  console.log(levon.id);
  console.log(arman.id);
  console.log(rubicock.id);
  await sleep(10000);
  console.log('after 10000');
  await apiGate.deleteResource(rubicock);
  await sleep(5000);
  console.log('after 5000');
  await apiGate.deleteResource(levon);
  await sleep(5000);
  console.log('after 5000');
  await apiGate.deleteResource(arman);
  await sleep(5000);
  console.log('after 5000');
  await apiGate.destroy();
};

const f = () => {
  Log.error(`${123123}`);
};
const g = (a: number) => {
  Log.trace(`${a}_1`);
  f();
  Log.fatal(`${a}_2`);
};
const h = (s: string) => {
  Log.info(`${s}_1`);
  g(999999);
  Log.info(`${s}_2`);
};

const main = async () => {
  h('abcd');
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
  // const myTable = new KeyValueStore<IVideoName>(
  //   Constants.hashTovideoDynamoTableName,
  //   videoNameTypeGuard
  // );
  //apiGate.destroy();
};

main().catch(err => console.log(`Something bad happened: ${err}`));
