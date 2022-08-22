import archiver = require('archiver');
import {Type} from 'aws-sdk/clients/cloudformation';
import * as fs from 'fs';

export interface IGuard<TypeGuard> {
  _guard: TypeGuard;
}

export type NotNull<T> = T extends null ? never : T;
export type NotUndefined<T> = T extends undefined ? never : T;
export type TypeGuarded<T, TypeGuard> = T extends IGuard<TypeGuard> ? T : never;
export type NotNullNotUndefined<T> = NonNullable<T>;

export const isUndefined = (x: unknown): x is undefined => {
  return x === undefined;
};

export const isNull = (x: unknown): x is null => {
  return x === null;
};

export function throwIfNull<T>(
  x: T,
  message: string = ''
): asserts x is NotNull<T> {
  if (isNull(x)) {
    throw new Error(message);
  }
}
export function throwIfUndefined<T>(
  x: T,
  message: string = ''
): asserts x is NotUndefined<T> {
  if (isUndefined(x)) {
    throw new Error(message);
  }
}

export type TypeGuardOf<T> = T extends IGuard<infer TypeGuard extends string>
  ? TypeGuard
  : never;

export function makeSureThatXIs<T>(
  x: unknown,
  typeGuard: TypeGuardOf<T>
): asserts x is T {
  if ((x as IGuard<TypeGuardOf<T>>)._guard !== typeGuard) {
    throw new Error(`TypeGuard check failed`);
  }
}

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const getCurrentDateAsString = () => {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}-${date.getMilliseconds()}`;
};

// TODO: investigate, why this function create 2 source code zips
export const archiveSourceCodeAndGetPath = async () => {
  const pathToZipFile = `./codebases`;
  fs.mkdir(`${pathToZipFile}`, {recursive: true}, err => {
    if (err) {
      return console.error(err);
    }
    console.log(`Directory ${pathToZipFile} created successfully!`);
  });
  const zipName: string = `codebase-${getCurrentDateAsString()}.zip`;
  console.log(`Creating zip file: ${pathToZipFile}/${zipName}`);
  const output = fs.createWriteStream(`${pathToZipFile}/${zipName}`);
  const archive = archiver('zip', {
    zlib: {level: 9}, // Sets the compression level.
  });

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log(
      'archiver has been finalized and the output file descriptor has closed.'
    );
  });

  output.on('end', function () {
    console.log('Data has been drained');
  });

  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      // log warning
    } else {
      // throw error
      throw err;
    }
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);

  console.log(`Adding package.json to the zip file: ${zipName}`);
  archive.file(`package.json`, {name: 'package.json'});
  console.log(`Adding node_modules to the zip file: ${zipName}`);
  archive.directory(`node_modules/`, `node_modules`);
  console.log(`Adding dist to the zip file: ${zipName}`);
  archive.directory(`dist/`, `dist`);
  await archive.finalize();
  console.log(`Zip file ${zipName} created`);
  return `${pathToZipFile}/${zipName}`;
};
