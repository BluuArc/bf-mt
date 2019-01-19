import registerPromiseWorker from 'promise-worker/register';
import PromiseWorkerExchange from './interface';

export default class PromiseWorkerExchangeWorker extends PromiseWorkerExchange {
  constructor () {
    super();
    registerPromiseWorker(({ command, data } = {}) => {
      return this.onRequest(command, data);
    });
  }

  async onRequest (methodName = '', data) {
    let result;
    if (this._commands.hasOwnProperty(methodName)) {
      result = await Promise.resolve().then(() => this._commands[methodName](data));
    } else if (this._classMethods.includes(methodName)) {
      result = await Promise.resolve().then(() => this[methodName](data));
    } else {
      result = Promise.reject(new Error(`Unknown command/method name [${methodName}]`));
    }
    return result;
  }
}
