
import archiver = require("archiver");
import * as fs from 'fs'

export type NotNull<T> = T extends null ? never : T;
export type NotUndefined<T> = T extends undefined ? never : T;
export type NotNullNotUndefined<T> = NonNullable<T>;

export const isUndefined = (x: unknown): x is undefined => {
    return x === undefined;
}

export const isNull = (x: unknown): x is null => {
    return x === null;
}


export const throwIfNull = <T>(x: T, message: string): asserts x is NotNull<T> => {
    if(isNull(x)) {
        throw new Error(message);
    }
}
export const throwIfUndefined = <T>(x: T, message: string): asserts x is NotUndefined<T> => {
    if(isUndefined(x)) {
        throw new Error(message);
    }
}

export const sleep = (ms: number) => {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export const getCurrentDateAsString = () => {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}-${date.getMilliseconds()}`;
}


// TODO: investigate, why this function create 2 source code zips
export const archiveSourceCode = async () => {
    const pathToSourceCode = `${__dirname}/../../..`;
    const pathToZipFile = `${pathToSourceCode}/codebases`;
    fs.mkdir(pathToZipFile, { recursive: true }, (err) => {
        if (err) {
            return console.error(err);
        }
        console.log(`Directory ${pathToZipFile} created successfully!`);
    });
    const zipName : string = `codebase-${getCurrentDateAsString()}.zip`;
    console.log(`Creating zip file: ${pathToZipFile}/${zipName}`);
    const output = fs.createWriteStream(`${pathToZipFile}/${zipName}`);
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    output.on('end', function() {
        console.log('Data has been drained');
    });

    archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
        // log warning
    } else {
        // throw error
        throw err;
    }
    });

    archive.on('error', function(err) {
        throw err;
    });

    archive.pipe(output);

    console.log(`Adding package.json to the zip file: ${zipName}`);
    archive.file(`${pathToSourceCode}/package.json`, { name: 'package.json' });
    console.log(`Adding src/node_modules to the zip file: ${zipName}`);
    archive.directory(`${pathToSourceCode}/node_modules/`, `node_modules`);
    console.log(`Adding src/dist to the zip file: ${zipName}`);
    archive.directory(`${pathToSourceCode}/dist/`, `dist`);
    await archive.finalize();
    console.log(`Zip file ${zipName} created`);

}
