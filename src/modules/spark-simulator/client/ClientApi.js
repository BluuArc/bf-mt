import PromiseWorkerExchangeClient from '@/modules/PromiseWorkerExchange/client';
import SparkSimWorkerInterface from '../ClientWorkerInterface';
import { convertSquadUnitEntryToSparkUnitEntry, getSimulatorOptions } from '@/modules/spark-simulator/utils';
import { Logger } from '@/modules/Logger';

// eslint-disable-next-line no-unused-vars
const logger = new Logger({ prefix: '[SparkSimWorker/client]' });
export default class SparkSimClient extends SparkSimWorkerInterface {
  constructor (exchangeWorker = new PromiseWorkerExchangeClient()) {
    super();
    this._worker = exchangeWorker;
    this._progressListeners = new Set();

    this._worker.registerCommand('progress', progress => {
      this.onProgress(progress);
    });
  }

  get exchangeWorker () {
    return this._worker;
  }

  request (method, data) {
    logger.debug('starting request for', { method, data });
    return this._worker.request(method, data);
  }

  run (simArguments = {
    permutations: null,
    sparkSquad: [convertSquadUnitEntryToSparkUnitEntry()],
    options: getSimulatorOptions(),
  }) {
    return this._worker.request('run', simArguments);
  }

  cancel () {
    return this._worker.request('cancel');
  }

  onProgress (progress = { total: 0, completed: 0 }) {
    this._progressListeners.forEach(listener => {
      listener(progress);
    });
  }

  addProgressListener (fn) {
    if (typeof fn === 'function') {
      this._progressListeners.add(fn);
    }
  }

  removeProgressListener (fn) {
    if (typeof fn === 'function') {
      this._progressListeners.delete(fn);
    }
  }

  removeAllListeners () {
    this._progressListeners.clear();
  }

  close () {
    this._worker.close();
    this._worker = null;
  }
}
