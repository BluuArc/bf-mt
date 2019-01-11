const logUpdate = require('log-update');

module.exports = class CliLogger {
  constructor (prefix = 'LOGGER') {
    this._prefix = prefix;
  }

  _generateLogPrefix (level = 'debug') {
    return `[${this._prefix}/${level}]`;
  }

  done (...args) {
    if (args.length > 0) {
      logUpdate(this._generateLogPrefix('done'), ...args);
    }
    logUpdate.done();
    return this;
  }

  clear () {
    logUpdate.clear();
    return this;
  }

  errDone (...args) {
    if (args.length > 0) {
      logUpdate.stderr(this._generateLogPrefix('done'), ...args);
    }
    logUpdate.stderr.done();
    return this;
  }

  errClear () {
    logUpdate.stderr.clear();
    return this;
  }

  debug (...args) {
    logUpdate(this._generateLogPrefix('debug'), ...args);
    return this;
  }

  error (...args) {
    logUpdate.stderr(this._generateLogPrefix('error'), ...args);
    return this;
  }

  warn (...args) {
    logUpdate(this._generateLogPrefix('warn'), ...args);
    return this;
  }

  log (...args) {
    logUpdate(this._generateLogPrefix('log'), ...args);
    return this;
  }

  info (...args) {
    logUpdate(this._generateLogPrefix('info'), ...args);
    return this;
  }
};
