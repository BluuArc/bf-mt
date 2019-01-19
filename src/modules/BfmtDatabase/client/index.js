// import Exchange from 'worker-exchange/lib/exchange-main';
import PromiseWorkerExchangeClient from '@/modules/PromiseWorkerExchange/client';
import DbWorker from 'worker-loader!../worker/index.js';
import ClientApi, { ClientTableApi, ClientMultidexApi } from './ClientApi';

let baseWorker = new DbWorker();
// TODO: remove?
function makeWorker (fullRestart = false) {
  if (fullRestart) {
    baseWorker.terminate();
    baseWorker = new DbWorker();
  }
  return new Proxy(new PromiseWorkerExchangeClient(baseWorker), {
    get(obj, prop) {
      return prop === 'restart' ?
        (restart) => makeWorker(restart) :
        obj[prop];
    },
  });
}
const worker = makeWorker();
// const worker = new Exchange(new DbWorker());
export default new ClientApi(worker);
export function makeTableInstance (tableName = '') {
  return new ClientTableApi(worker, tableName);
}

export function makeMultidexTableInstance (tableName = '') {
  return new ClientMultidexApi(worker, tableName);
}
