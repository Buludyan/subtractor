import {SQS} from './aws-services/sqs';
import {S3Bucket} from './aws-services/s3-bucket';
import {KeyValueStore} from './aws-services/dynamo-db';
import {urlToHttpOptions} from 'url';
import * as Constants from './project-specific-constants';
import {type} from 'os';
import {
  makeSureThatXIs,
  IGuard,
  throwIfUndefined,
} from './utilities/common-utils';
import {IVideoName, videoNameTypeGuard} from './project-specific-interfaces';

console.log(`Compilation passed successfully!`);
const work = async () => {};

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
  const myTable = new KeyValueStore<IVideoName>(
    Constants.hashTovideoDynamoTableName,
    videoNameTypeGuard
  );
  const a: any = {
    _guard: videoNameTypeGuard,
    videoName: videoNameTypeGuard,
    asdad: 1123,
  };
  makeSureThatXIs<IVideoName>(a, videoNameTypeGuard);
  a;
};

main().catch(err => console.log(`Something bad happened: ${err}`));
