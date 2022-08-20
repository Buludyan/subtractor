import {AWSError} from 'aws-sdk/lib/error';
import * as Utils from '../utilities/common-utils';

export const isAwsError = (err: unknown): err is AWSError => {
  // eslint-disable-next-line
  return (
    !Utils.isUndefined((err as AWSError).code) &&
    !Utils.isUndefined((err as AWSError).message)
  );
};

export const callAws = async <ResultType>(
  toDo: () => Promise<ResultType>,
  errorHandler: (err: AWSError) => Promise<ResultType | null>
): Promise<ResultType> => {
  // 1 minute is more than enough because usually retryDelay is 15-30 msecs
  const maximalTimeToWaitInMillis = 60 * 1000;

  const start = new Date().getMilliseconds();
  const checkTimeLimit = () => {
    const now = new Date().getMilliseconds();
    const duration = now - start;
    if (duration >= maximalTimeToWaitInMillis) {
      throw Error(
        `Time limit exceeded (${maximalTimeToWaitInMillis} msecs) for AWS function call. Error is NOT an AWS error.`
      );
    }
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    checkTimeLimit();

    try {
      return await toDo();
    } catch (err) {
      if (!isAwsError(err)) {
        throw Error(
          `Error occurred while invoking AWS function. Error is NOT an AWS error. err = ${err}`
        );
      }
      if (err.retryable) {
        // TODO: consider random delay addition
        const retryDelay = err.retryDelay ?? 0;
        await Utils.sleep(retryDelay);
      } else {
        const errorHandlerResult = await errorHandler(err);
        if (!Utils.isNull(errorHandlerResult)) {
          return errorHandlerResult;
        } else {
          // do not rethrowing AWSError, because it does not contain any valuable for us data
          throw Error(
            `Error occurred while invoking AWS function. Error is an AWS error. err = ${err}`
          );
        }
      }
    }
  }
};
