import {Logger} from 'tslog';

const _log: Logger = new Logger({name: 'myLogger'});

export class Log {
  static readonly error = async (message: string) => {
    _log.trace();
    _log.error(message);
    // TODO: take stack trace
    // process stacktrace (SourceMapping)
    // send to cloud watch
    // console.error(<>)
  };
  static readonly info = async (message: string) => {
    _log.info(message);
  };
  static readonly trace = async (message: string) => {
    _log.trace(message);
  };
  static readonly fatal = async (message: string) => {
    _log.fatal(message);
  };
}
