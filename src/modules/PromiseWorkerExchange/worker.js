import registerPromiseWorker from 'promise-worker/register';
import PromiseWorkerExchange from './interface';

export default class PromiseWorkerExchangeWorker extends PromiseWorkerExchange {
  constructor () {
    super();

    registerPromiseWorker(async ({ command, data } = {}) => {
      this.onRequest(command, data);
    });
  }

  async onRequest (methodName = '', data) {
    let result;
    if (this._commands.hasOwnProperty(methodName)) {
      result = await Promise.resolve().then(() => this._commands[methodName](data));
    } else if (this._classMethods.includes(methodName)) {
      result = await Promise.resolve().then(() => this[methodName](data));
    } else {
      throw new Error(`Unknown command name [${methodName}]`);
    }
    return result;
  }
}
