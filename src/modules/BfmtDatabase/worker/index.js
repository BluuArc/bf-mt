import PromiseWorkerExchangeWorker from '@/modules/PromiseWorkerExchange/worker';
import WorkerDb from './WorkerDb';
import dbInstance from './dexie-instance';
import logger from './logger';

const dbApi = new WorkerDb(dbInstance);
const instance = new PromiseWorkerExchangeWorker();

function init () {
  const methodsToInit = Object.getOwnPropertyNames(dbApi.__proto__)
    .filter(name => !name.startsWith('_') && name !== 'constructor');
  logger.debug('adding handlers for dbApi methods', methodsToInit);
  methodsToInit.forEach(method => {
    instance.registerCommand(method, (data) => {
      logger.debug('got command', { method, data });
      return dbApi[method](data);
    });
  });
  logger.debug('worker initialized');
}

instance.registerCommand('ping', (data) => `Pong ${data.from}`);
init();
