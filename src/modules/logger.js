
// centralized class for logging
export class Logger {
  constructor ({ prefix = '' }) {
    this.prefix = prefix;
  }

  /* eslint-disable no-console */
  assert (assertion = false, ...args) {
    console.assert(assertion, this.prefix, ...args);
  }

  debug (...args) {
    console.debug(this.prefix, 'debug:'.toUpperCase(), ...args);
  }

  error (...args) {
    console.error(this.prefix, 'error:'.toUpperCase(), ...args);
  }

  info (...args) {
    console.info(this.prefix, 'info:'.toUpperCase(), ...args);
  }

  log (...args) {
    console.log(this.prefix, 'log:'.toUpperCase(), ...args);
  }

  warn (...args) {
    console.warn(this.prefix, 'warn:'.toUpperCase(), ...args);
  }
  /* eslint-enable no-console */
}

export default new Logger({ prefix: '[APP]' });
