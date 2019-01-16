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

  getFieldInEntry (table = '', query, field = '') {
    return this._worker.request('getFieldInEntry', { table, query, field });
  }
  
  getFieldKeys (table = '', query, field = '') {
    return this._worker.request('getFieldKeys', { table, query, field });
  }

  getByIds ({ table = '', query, field, ids = [], extractedFields = [] }) {
    return this._worker.request('getByIds', { table, query, field, ids, extractedFields });
  }

  getById ({ table = '', query, field, id }) {
    return this._worker.request('getById', { table, query, field, id });
  }

  getDbStats (table = '', query) {
    return this._worker.request('getDbStats', { table, query });
  }
}
