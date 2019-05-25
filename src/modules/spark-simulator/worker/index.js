import PromiseWorkerExchangeWorker from '@/modules/PromiseWorkerExchange/worker';
import logger from './logger';
import SparkSimWorker from './WorkerApi';

const workerApi = new SparkSimWorker();
const instance = new PromiseWorkerExchangeWorker();

function init () {
  // add handlers for all dbApi methods
  const methodsToInit = Object.getOwnPropertyNames(Object.getPrototypeOf(workerApi))
    .filter(name => !name.startsWith('_') && name !== 'constructor');
  logger.debug('adding handlers for dbApi methods', methodsToInit);
  methodsToInit.forEach(method => {
    instance.registerCommand(method, async (data) => {
      logger.debug('got command', { method, data });
      const result = await Promise.resolve().then(() => workerApi[method](data));
      logger.debug('got result', { method, result });
      return result;
    });
  });
  workerApi.setProgressFunction(progress => {
    instance.request('progress', progress);
  });
  logger.debug('worker initialized');
}
init();
