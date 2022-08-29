import {Logger} from 'tslog';
require('fix-esm').register();
import * as StackTrace from 'stack-trace';
import {isNull, isUndefined} from './common-utils';
import * as SourceMapSupport from 'source-map-support';

const _log: Logger = new Logger({name: 'myLogger'});

type CallStackEntry = {
  functionName: string | null;
  sourceLocation: {
    sourceFilePath: string | null;
    row: number | null;
    col: number | null;
  };
};

type Exception = {
  message: string;
  typeName: string;
  stack: CallStackEntry[];
};

const getCallStack = (exception: Error | null): CallStackEntry[] => {
  const unmappedCallstack = isNull(exception)
    ? StackTrace.get()
    : StackTrace.parse(exception);
  if (!unmappedCallstack || !unmappedCallstack.length) {
    return [];
  }
  const thisStackTrace = unmappedCallstack.map((stackEntry): CallStackEntry => {
    const callSite = SourceMapSupport.wrapCallSite(
      stackEntry as SourceMapSupport.CallSite
    );
    const functionName = callSite.getFunctionName()
      ? callSite.getFunctionName()
      : callSite.getMethodName()
      ? callSite.getMethodName()
      : null;
    const fileName = callSite.getFileName();
    return {
      functionName: functionName,
      sourceLocation: {
        sourceFilePath: fileName,
        row: callSite.getLineNumber(),
        col: callSite.getColumnNumber(),
      },
    };
  });
  return thisStackTrace;
};

/** @internal */
const getException = (exception: unknown): Exception | null => {
  const isError = (exception: unknown): exception is Error => {
    return (
      !isUndefined((exception as Error).stack) &&
      !isUndefined((exception as Error).message)
    );
  };

  if (isUndefined(exception) || isNull(exception) || !isError(exception)) {
    return null;
  }

  const exceptionCallStack = StackTrace.parse(exception);
  if (!exceptionCallStack || !exceptionCallStack.length) {
    return null;
  }

  return {
    message: exception.message,
    typeName: exception.name,
    stack: getCallStack(exception),
  };
};

const stackEntryToString = (entry: CallStackEntry) => {
  return `[${entry.sourceLocation.sourceFilePath}:${entry.sourceLocation.row}:${entry.sourceLocation.col}] [${entry.functionName}]`;
};

export class Log {
  static readonly error = async (message: string) => {
    _log.error(`Message: ${message}`);
    _log.error(
      `CallStack:\n${getCallStack(null)
        .map(elem => stackEntryToString(elem))
        .join('\n')}`
    );
    // TODO: take stack trace
    // process stacktrace (SourceMapping)
    // send to cloud watch
  };
  static readonly info = async (message: string) => {
    _log.info(message);
  };
  static readonly trace = async (message: string) => {
    _log.trace(message);
  };
  static readonly throw = async (message: string) => {
    this.error(message);
    throw new Error(message);
  };
  static readonly rethrow = async (message: string, err: unknown) => {
    const ex = getException(err);
    if (isNull(ex)) {
      _log.error(`Message: ${message}`);
      throw err;
    }
    _log.error(`Message: ${message}`);
    _log.error(`Exception message: ${JSON.stringify(ex.message)}`);
    _log.error(`Exception typename: ${JSON.stringify(ex.typeName)}`);
    _log.error(
      `CallStack:\n${ex.stack.map(elem => stackEntryToString(elem)).join('\n')}`
    );
    throw err;
  };
  static readonly fatal = async (message: string) => {
    _log.fatal(message);
  };
}
