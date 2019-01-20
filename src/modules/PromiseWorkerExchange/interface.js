
/* loosely follows request/onRequest API used by worker-exchange module, but uses promise-worker instead */
export default class PromiseWorkerExchange {
  constructor () {
    // usage of this depends on subclass implementation
    // can choose to either use class methods only, registered commands only, or both
    this._commands = {};
  }

  /* eslint-disable no-unused-vars */
  static _defer (name = 'name of method to be deferred') {
    return Promise.reject(new Error(`Must implement ${name}() in subclass`));
  }

  // based off of https://stackoverflow.com/a/31055217 and https://stackoverflow.com/a/47714550
  // intended to be used in PromiseWorker onMessage callback for worker
  get _classMethods () {
    let props = [];
    let currentObj = this;
    const isPublicAccessible = (methodName) => (methodName !== 'constructor' && !methodName.startsWith('_'));
    const isGetter = (obj, name) => (Object.getOwnPropertyDescriptor(obj, name) || {}).get;
    const isFunction = (obj, name) => typeof obj[name] === 'function';
    do {
      const currentMethods = Object.getOwnPropertyNames(currentObj)
        .filter(name => isPublicAccessible(name) && (isGetter(currentObj, name) || isFunction(currentObj, name)));
      props = props.concat(currentMethods);
    } while ((currentObj = Object.getPrototypeOf(currentObj)) && currentObj !== Object.prototype);

    return Array.from(new Set(props));
  }

  request (methodName, data) {
    return PromiseWorkerExchange._defer('request');
  }

  onRequest (methodName, data) {
    return PromiseWorkerExchange._defer('onRequest');
  }

  registerCommand (commandName, func) {
    if (typeof func !== 'function') {
      throw new Error('Input is not a function');
    }

    this._commands[commandName] = func;
  }

  unregisterCommand (commandName) {
    if (this._commands.hasOwnProperty(commandName)) {
      delete this._commands[commandName];
    }
  }
  /* eslint-enable no-unused-vars */
}
