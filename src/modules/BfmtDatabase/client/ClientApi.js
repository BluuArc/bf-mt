import Exchange from 'worker-exchange/lib/exchange-main';
import DbInterface from '../interface';

export default class ClientApi extends DbInterface {
  constructor (exchangeWorker = new Exchange()) {
    super();
    this._worker = exchangeWorker;
  }

  get exchangeWorker () {
    return this._worker;
  }

  request (...args) {
    return this._worker.request(...args);
  }

  put (table = '', entry) {
    return this._worker.request('put', { table, entry });
  }

  get (table = '', query) {
    return this._worker.request('get', { table, query });
  }
}
