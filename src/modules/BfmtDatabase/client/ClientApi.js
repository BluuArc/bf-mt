// import Exchange from 'worker-exchange/lib/exchange-main';
import PromiseWorkerExchangeClient from '@/modules/PromiseWorkerExchange/client';
import DbInterface from '../interface';
import { Logger } from '@/modules/Logger';

// eslint-disable-next-line no-unused-vars
const logger = new Logger({ prefix: '[DB-WORKER/client]' });
export default class ClientApi extends DbInterface {
  constructor (exchangeWorker = new PromiseWorkerExchangeClient()) {
    super();
    this._worker = exchangeWorker;
  }

  get exchangeWorker () {
    return this._worker;
  }

  // add request to queue
  request (method, data) {
    logger.debug('starting request for', { method, data });
    return this._worker.request(method, data);
  }

  put (table = '', entry) {
    return this.request('put', { table, entry });
  }

  get (table = '', query) {
    return this.request('get', { table, query });
  }

  getFieldInEntry (table = '', query, field = '') {
    return this.request('getFieldInEntry', { table, query, field });
  }
  
  getFieldKeys (table = '', query, field = '') {
    return this.request('getFieldKeys', { table, query, field });
  }

  getByIds ({ table = '', query, field, ids = [], extractedFields = [] }) {
    return this.request('getByIds', { table, query, field, ids, extractedFields });
  }

  getById ({ table = '', query, field, id }) {
    return this.request('getById', { table, query, field, id });
  }

  getDbStats (table = '', query) {
    return this.request('getDbStats', { table, query });
  }
}

export class ClientTableApi extends ClientApi {
  constructor (exchangeWorker = new PromiseWorkerExchangeClient(), tableName = '') {
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
    return this.request('getTablesWithEntries', { tables, server });
  }

  getDbStats (server) {
    return super.getDbStats({ server });
  }

  getFilteredDb ({ filters, server = 'gl', extractedFields }) {
    return this.request('getFilteredDb', {
      table: this._table,
      filters,
      server,
      extractedFields,
    });
  }
}
