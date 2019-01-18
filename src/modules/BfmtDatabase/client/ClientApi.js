import Exchange from 'worker-exchange/lib/exchange-main';
import DbInterface from '../interface';
import { Logger } from '@/modules/Logger';

const logger = new Logger({ prefix: '[DB-WORKER/client]' });
export default class ClientApi extends DbInterface {
  constructor (exchangeWorker = new Exchange()) {
    super();
    this._worker = exchangeWorker;
    this._pendingHandshakes = {};
    this._pendingRequests = [];
    this._isProcessingRequests = false;
    this._processingRequestTimeout = null;
  }

  get _handshakeTimeout () {
    return 10 * 1000;
  }

  get exchangeWorker () {
    return this._worker;
  }

  async _processNextRequest () {
    if (this._isProcessingRequests || this._pendingRequests.length === 0) {
      return;
    }
    this._isProcessingRequests = true;

    let currentRequest = null;
    try {
      let timeout = null;
      const sendRequest = ({ method, data, fulfill, handshakeKey }) => this._worker.request(method, { handshakeKey, ...data })
        .then(result => {
          // successfully got request, so clear handshake setup
          delete this._pendingHandshakes[handshakeKey];
          if (timeout !== null) {
            clearTimeout(timeout);
          }
          fulfill(result);
        });
      // process one request at a time
      while (this._pendingRequests.length > 0) {
        const { method, data, fulfill, reject } = this._pendingRequests.shift();
        currentRequest = { method, data, fulfill, reject };
        logger.debug('processing request', currentRequest);

        await new Promise((whileFulfill, whileReject) => {
          const handshakeKey = Math.random();
          this._pendingHandshakes[handshakeKey] = true;
          let hasRestarted = false;

          const attemptSendRequest = () => {
            sendRequest({ method, data, fulfill, handshakeKey })
              .then(whileFulfill)
              .catch(whileReject);
            timeout = setTimeout(async () => {
              const hasEntry = this._pendingHandshakes.hasOwnProperty(handshakeKey);
              if (hasEntry && !!this._pendingHandshakes[handshakeKey]) {
                // request has not responded in time

                if (!hasRestarted) {
                  logger.warn('Timeout occurred. Trying again after restarting worker');
                  // restart worker and try again
                  await Promise.resolve(this._worker.terminate())
                    .then(() => logger.debug('terminated old worker'))
                    .catch(err => logger.error('error disposing old worker:', err));
                  this._worker = this._worker.restart(true);
                  hasRestarted = true;
                  attemptSendRequest();
                } else {
                  delete this._pendingHandshakes[handshakeKey];
                  whileReject(new Error(`Timeout in sending request for method [${method}]`));
                }
              } else if (hasEntry) {
                delete this._pendingHandshakes[handshakeKey];
              }
            }, this._handshakeTimeout);
          };
          attemptSendRequest();
          currentRequest = null;
        });
      }

      this._processingRequestTimeout = setTimeout(() => {
        this._processNextRequest();
      }, this._handshakeTimeout);
    } catch (err) {
      logger.error(err);
      // if there was a current request that failed, reject its promise
      if (currentRequest && Object.values(currentRequest).some(v => v)) {
        currentRequest.reject(err);
      }

      // reject all remaining requests
      this._pendingRequests.forEach(({ reject }) => reject(err));
      this._pendingRequests = [];
    } finally {
      this._isProcessingRequests = false;
    }
  }

  // add request to queue
  request (method, data) {
    return new Promise((fulfill, reject) => {
      this._pendingRequests.push({ method, data, fulfill, reject });
      if (!this._isProcessingRequests) {
        this._processNextRequest();
      }
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
