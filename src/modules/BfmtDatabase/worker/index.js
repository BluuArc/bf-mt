import Exchange from 'worker-exchange/lib/exchange-worker';
import WorkerDb from './WorkerDb';
import dbInstance from './dexie-instance';
import logger from './logger';

const exchange = new Exchange();
const dbApi = new WorkerDb(dbInstance);

function init () {
  self.addEventListener('message', function Once() {
    // I am a dedicated worker
    exchange.addPort(self);
    self.removeEventListener('message', Once);
  });
  self.exchange = exchange;

  const methodsToInit = Object.getOwnPropertyNames(dbApi.__proto__)
    .filter(name => !name.startsWith('_') && name !== 'constructor');
  logger.debug('adding handlers for dbApi methods', methodsToInit);
  methodsToInit.forEach(method => {
    exchange.onRequest(method, (data, message) => {
      logger.debug(`method=${method}`, { data });
      message.response = dbApi[method](data);
    });
  });
  logger.debug('worker initialized');
}

exchange.onRequest('ping', function (data, message) {
  message.response = 'Pong ' + data.from;
});
init();
