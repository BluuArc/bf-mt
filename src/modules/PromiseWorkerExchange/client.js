import PromiseWorker from 'promise-worker';
import PromiseWorkerExchange from './interface';

export default class PromiseWorkerExchangeClient extends PromiseWorkerExchange {
  constructor (worker = new Worker()) {
    super();
    this._worker = worker;
    this._promiseWorker = new PromiseWorker(worker);

    worker.addEventListener('message', e => {
      const payload = e.data;
      if (typeof payload === 'object' && payload.command !== undefined) {
        this.onRequest(payload.command, payload.data);
      }
    });
  }

  request (methodName, data) {
    return this._promiseWorker.postMessage({ command: methodName, data });
  }

  // one-way message from worker to client
  onRequest (methodName, data) {
    if (this._commands.hasOwnProperty(methodName)) {
      this._commands[methodName](data);
    }
  }
}
