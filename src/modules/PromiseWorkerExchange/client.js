import PromiseWorker from 'promise-worker';
import PromiseWorkerExchange from './interface';

export class PromiseWorkerExchangeClient extends PromiseWorkerExchange {
  constructor (worker = new Worker()) {
    super();
    this._promiseWorker = new PromiseWorker(worker);
  }

  request (methodName, data) {
    return this._promiseWorker.postMessage({ command: methodName, data });
  }

  // TODO: implement messaging from worker outside of requests (mainly for progress updates)
}
