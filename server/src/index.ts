
import { workerData } from 'worker_threads';
import { SQS } from './aws-services/sqs';
import { S3Bucket } from './aws-services/s3-bucket';
import { urlToHttpOptions } from 'url';
import { archiveSourceCode } from './utilities/common-utils'
console.log(`Compilation passed successfully!`);
const work = async () => {

}

const main = async () => {
  // const mySqs = new SQS("MyNewSQS1");
  // await mySqs.deploy();
  // await work();
  // await mySqs.undeploy();

  // const myBucket = new S3Bucket("my-bucket-for-levon-arman");
  // await myBucket.deploy();
  // await myBucket.undeploy();
  
  archiveSourceCode();
}

main()
.catch(err => console.log(`Something bad happened: ${err}`)); 