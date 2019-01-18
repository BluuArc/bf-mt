import Exchange from 'worker-exchange/lib/exchange-main';
import DbInterface from '../interface';
import { Logger } from '@/modules/Logger';

const logger = new Logger({ prefix: '[DB-WORKER/client]' });
export default class ClientApi extends DbInterface {
  constructor (exchangeWorker = new Exchange()) {
    super();
    this._worker = exchangeWorker;
    this._pendingHandshakes = {};
  }

  get _handshakeTimeout () {
    return 10 * 1000;
  }

  get _maxRetries () {
    return 2;
  }

  get exchangeWorker () {
    return this._worker;
  }

  request (method, data) {
    const handshakeKey = Math.random();
    return new Promise((fulfill, reject) => {
      this._pendingHandshakes[handshakeKey] = true;
      let totalAttempts = 0;
      let attempts = 0;
      let timeout = null;
      let hasRestarted = false;

      const sendRequest = () => this._worker.request(method, { handshakeKey, ...data })
        .then(result => {
          // successfully got request, so clear handshake setup
          delete this._pendingHandshakes[handshakeKey];
          if (timeout !== null) {
            clearTimeout(timeout);
          }
          fulfill(result);
        }).catch(reject);

      const startWait = () => timeout = setTimeout(async () => {
        const hasEntry = this._pendingHandshakes.hasOwnProperty(handshakeKey);
        if (hasEntry && !!this._pendingHandshakes[handshakeKey]) {
          // request has not responded in time
          attempts++;
          totalAttempts++;
          logger.warn('Timeout occurred. Trying again. Attempts so far', totalAttempts);

          if (attempts < this._maxRetries) {
            // try again
            sendRequest();
            startWait();
          } else if (!hasRestarted) {
            // restart worker and try again
            await Promise.resolve(this._worker.terminate())
              .then(() => logger.debug('disposed old worker'))
              .catch(err => logger.error('error disposing old worker:', err));
            this._worker = this._worker.restart(true);
            attempts = 0;
            hasRestarted = true;
            sendRequest();
            startWait();
          } else {
            delete this._pendingHandshakes[handshakeKey];
            reject(new Error(`Timeout in sending request for method [${method}]`));
          }
        } else if (hasEntry) {
          delete this._pendingHandshakes[handshakeKey];
        }
      }, this._handshakeTimeout);
      
      sendRequest();
      startWait();
    });
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
