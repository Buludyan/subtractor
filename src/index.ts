
import { workerData } from 'worker_threads';
import { SQS } from './sqs';
import { S3Bucket } from './s3Bucket';
console.log(`Compilation passed successfully!`);
const work = async () => {

}

const main = async () => {
  // const mySqs = new SQS("MyNewSQS1");
  // await mySqs.deploy();
  // await work();
  // await mySqs.undeploy();

  const myBucket = new S3Bucket("my-bucket-for-levon-arman");
  await myBucket.deploy();
  await myBucket.undeploy();
  await myBucket.undeploy();
}

main()
.catch(err => console.log(`Something bad happened: ${err}`)); 