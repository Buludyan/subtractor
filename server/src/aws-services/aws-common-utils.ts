import {Log} from './../utilities/log';
import {AWSError} from 'aws-sdk/lib/error';
import * as Utils from '../utilities/common-utils';

export const isAwsError = (err: unknown): err is AWSError => {
  return (
    !Utils.isUndefined((err as AWSError).code) &&
    !Utils.isUndefined((err as AWSError).message)
  );
};

export const awsCommand = async <ResultType>(
  work: () => Promise<ResultType>,
  errorProcessor: (err: AWSError) => Promise<ResultType | null>
): Promise<ResultType> => {
  const start = new Date().getMilliseconds();
  const checkLimitsOfTime = () => {
    const maximalWaitingTimeInMillis = 60 * 1000;
    const now = new Date().getMilliseconds();
    const duration = now - start;
    if (duration >= maximalWaitingTimeInMillis) {
      const errorMessage = `[NOT AWS] Time limit exceeded (${maximalWaitingTimeInMillis} msecs) for awsCommand function call.`;
      Log.error(errorMessage);
      throw Error(errorMessage);
    }
  };

  while (true) {
    checkLimitsOfTime();

    try {
      return await work();
    } catch (err) {
      if (!isAwsError(err)) {
        const errorMessage = `[NOT AWS] Error occurred in awsCommand, err=${err}`;
        Log.error(errorMessage);
        throw Error(errorMessage);
      }
      if (err.retryable) {
        await Utils.sleep(err.retryDelay ?? 0);
        continue;
      }
      // not retryable
      const errorHandlerResult = await errorProcessor(err);
      if (!Utils.isNull(errorHandlerResult)) {
        return errorHandlerResult;
      }
      const errorMessage = `[AWS] Error occurred in awsCommand, err=${err}`;
      Log.error(errorMessage);
      throw Error(errorMessage);
    }
  }
};
