import {SQS} from './aws-services/sqs';
import {S3Bucket} from './aws-services/s3-bucket';
import {KeyValueStore} from './aws-services/dynamo-db';
import {urlToHttpOptions} from 'url';
import {archiveSourceCodeAndGetPath} from './utilities/common-utils';
console.log(`Compilation passed successfully!`);
const work = async () => {};

const main = async () => {
  // const mySqs = new SQS("MyNewSQS1");
  // await mySqs.deploy();
  // await work();
  // await mySqs.undeploy();

  // const myBucket = new S3Bucket("my-bucket-for-levon-arman");
  // await myBucket.deploy();
  // await myBucket.undeploy();

  const myTable = new KeyValueStore('my-dynamo-db-table-for-levon-arman');
  //await myTable.deploy();
  await myTable.undeploy();

  //await archiveSourceCodeAndGetPath();
};

main().catch(err => console.log(`Something bad happened: ${err}`));
