import Exchange from 'worker-exchange/lib/exchange-main';
import DbWorker from 'worker-loader!../worker/index.js';
import ClientApi, { ClientTableApi, ClientMultidexApi } from './ClientApi';

const makeWorker = () => new Proxy(new Exchange(new DbWorker), {
  get (obj, prop) {
    return prop === 'restart'
      ? () => makeWorker()
      : obj[prop];
  },
});
const worker = makeWorker();
// const worker = new Exchange(new DbWorker());
export default new ClientApi(worker);
export function makeTableInstance (tableName = '') {
  return new ClientTableApi(worker, tableName);
}

export function makeMultidexTableInstance (tableName = '') {
  return new ClientMultidexApi(worker, tableName);
}
