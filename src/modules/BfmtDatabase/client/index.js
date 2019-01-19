// import Exchange from 'worker-exchange/lib/exchange-main';
import PromiseWorkerExchangeClient from '@/modules/PromiseWorkerExchange/client';
import DbWorker from 'worker-loader!../worker/index.js';
import ClientApi, { ClientTableApi, ClientMultidexApi } from './ClientApi';

const worker = new PromiseWorkerExchangeClient(new DbWorker());
// const worker = new Exchange(new DbWorker());
export default new ClientApi(worker);
export function makeTableInstance (tableName = '') {
  return new ClientTableApi(worker, tableName);
}

export function makeMultidexTableInstance (tableName = '') {
  return new ClientMultidexApi(worker, tableName);
}
