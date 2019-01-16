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

export class ClientTableApi extends ClientApi {
  constructor (exchangeWorker = new Exchange(), tableName = '') {
    super(exchangeWorker);
    this._table = tableName;
  }

  put (entry) {
    return super.put(this._table, entry);
  }

  get (query) {
    return super.get(this._table, query);
  }

  getFieldInEntry (query, field = '') {
    return super.getFieldInEntry(this._table, query, field);
  }

  getFieldKeys (query, field = '') {
    return super.getFieldKeys(this._table, query, field);
  }

  getByIds ({ query, field, ids = [], extractedFields = [] }) {
    return super.getByIds({
      table: this._table,
      query,
      field,
      ids,
      extractedFields,
    });
  }

  getById ({ query, field, id }) {
    return super.getById({
      table: this._table,
      query,
      field,
      id,
    });
  }

  getDbStats (query) {
    return super.getDbStats(this._table, query);
  }
}

export class ClientMultidexApi extends ClientTableApi {
  getByIds ({ server, ids = [], extractedFields = [] }) {
    return super.getByIds({
      query: { server },
      field: 'data',
      ids,
      extractedFields,
    });
  }

  getById ({ server, id }) {
    return super.getById({
      query: { server },
      field: 'data',
      id,
    });
  }

  getTablesWithEntries (tables = [], server = 'gl') {
    return this._worker.request('getTablesWithEntries', { tables, server });
  }

  getDbStats (server) {
    return super.getDbStats({ server });
  }
}
