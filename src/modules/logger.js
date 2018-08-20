
// centralized class for logging
// TODO: special styling?
export class Logger {
  constructor ({ prefix = '' }) {
    this.prefix = prefix;
  }

  /* eslint-disable no-console */
  assert (assertion = false, ...args) {
    console.assert(assertion, this.prefix, ...args);
  }

  debug (...args) {
    console.debug(this.prefix, ...args);
  }

  error (...args) {
    console.error(this.prefix, ...args);
  }

  info (...args) {
    console.info(this.prefix, ...args);
  }

  log (...args) {
    console.log(this.prefix, ...args);
  }

  warn (...args) {
    console.warn(this.prefix, ...args);
  }
  /* eslint-enable no-console */
}

export default new Logger({ prefix: '[APP]' });
