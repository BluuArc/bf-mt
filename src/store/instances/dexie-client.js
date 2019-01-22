// const PromiseWorker = require('promise-worker');
// const worker = new Worker('static/js/dexie-worker.js');
// const pw = new PromiseWorker(worker);
// basically an adapter for old API using raw PromiseWorker
import defaultClient, { makeTableInstance, makeMultidexTableInstance } from '@/modules/BfmtDatabase/client';

const wrapper = Object.freeze({
  // worker: pw,
  worker: defaultClient,
  put: (table, entry) => defaultClient.put(table, entry),
  get: (table, entry) => defaultClient.get(table, entry),
  getFieldInEntry: (table, query, field) => defaultClient.getFieldInEntry(table, query, field),
  getFieldKeys: (table, query, field) => defaultClient.getFieldKeys(table, query, field),
  getById: (table, query, field, id) => defaultClient.getById({ table, query, field, id }),
  getByIds: (table, query, field, ids, extractedFields) => defaultClient.getByIds({ table, query, field, ids, extractedFields }),
  // put: (table, entry) => pw.postMessage({ command: 'put', args: [table, entry] }),
  // get: (table, query) => pw.postMessage({ command: 'get', args: [table, query] }),
  // getFieldInEntry: (table, query, field) => pw.postMessage({ command: 'getFieldInEntry', args: [table, query, field] }),
  // getFieldKeyLength: (table, query, field) => pw.postMessage({ command: 'getFieldKeyLength', args: [table, query, field] }),
  // getFieldKeys: (table, query, field) => pw.postMessage({ command: 'getFieldKeys', args: [table, query, field] }),
  // getById: (table, query, field, id) => pw.postMessage({ command: 'getById', args: [table, query, field, id] }),
});

export function makeWorker (table) {
  const instance = makeTableInstance(table);
  return Object.freeze({
    worker: instance,
    put: entry => instance.put(entry),
    get: query => instance.get(query),
    getFieldInEntry: (query, field) => instance.getFieldInEntry(query, field),
    getFieldKeys: (query, field) => instance.getFieldKeys(query, field),
    getById: (query, field, id) => instance.getById({ query, field, id }),
    getByIds: (query, field, ids, extractedFields) => instance.getByIds({ query, field, ids, extractedFields  }),
    getDbStats: (query) => instance.getDbStats(query),
  });
}

// export const makeWorker = (table) => Object.freeze({
//   worker: pw,
//   put: entry => wrapper.put(table, entry),
//   get: query => wrapper.get(table, query),
//   getFieldInEntry: (query, field) => wrapper.getFieldInEntry(table, query, field),
//   getFieldKeyLength: (query, field) => wrapper.getFieldKeyLength(table, query, field),
//   getFieldKeys: (query, field) => wrapper.getFieldKeys(table, query, field),
//   getById: (query, field, id) => wrapper.getById(table, query, field, id),
//   getDbStats: (query) => pw.postMessage({
//     command: 'getDbStats',
//     args: [table, query],
//   }),
// });

export function makeMultidexWorker (moduleName) {
  const instance = makeMultidexTableInstance(moduleName);
  return Object.freeze({
    worker: instance,
    put: entry => instance.put(entry),
    get: query => instance.get(query),
    getFieldInEntry: (query, field) => instance.getFieldInEntry(query, field),
    getFieldKeys: (query, field) => instance.getFieldKeys(query, field),
    getById: (server, id) => instance.getById({ server, id }),
    getByIds: (server, ids, extractedFields) => instance.getByIds({ server, ids, extractedFields }),
    getDbStats: ({ server } = {}) => instance.getDbStats(server),
    getTablesWithEntries: (tables, server) => instance.getTablesWithEntries(tables, server),
    getMiniDb: (server, filters, extractedFields) => instance.getFilteredDb({ server, filters, extractedFields }),
    getFilteredKeys: (server, filters, sortOptions) => instance.getFilteredDb({ server, filters, sortOptions }),
    getSortedKeys: (server, keys, sortOptions) => instance.getSortedKeys({ server, keys, sortOptions }),
  });
}

// export function makeMultidexWorker (moduleName) {
//   const miniDbCommand = `getMiniDb${moduleName[0].toUpperCase().concat(moduleName.slice(1))}`;
//   return {
//     ...makeWorker(moduleName),
//     getById: (server, id) => wrapper.getById(moduleName, { server }, 'data', id),
//     getMiniDb: (server, searchQuery = {}, miniDbFields = []) => wrapper.worker.postMessage({ command: miniDbCommand, args: [server, searchQuery, miniDbFields] }),
//   };
// }

export default wrapper;
