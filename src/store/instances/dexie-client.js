const PromiseWorker = require('promise-worker');
const worker = new Worker('static/js/dexie-worker.js');
const pw = new PromiseWorker(worker);

const wrapper = {
  worker: pw,
  put: (table, entry) => pw.postMessage({ command: 'put', args: [table, entry] }),
  get: (table, query) => pw.postMessage({ command: 'get', args: [table, query] }),
  getFieldInEntry: (table, query, field) => pw.postMessage({ command: 'getFieldInEntry', args: [table, query, field] }),
  getFieldKeyLength: (table, query, field) => pw.postMessage({ command: 'getFieldKeyLength', args: [table, query, field] }),
  getFieldKeys: (table, query, field) => pw.postMessage({ command: 'getFieldKeys', args: [table, query, field] }),
  getById: (table, query, field, id) => pw.postMessage({ command: 'getById', args: [table, query, field, id] }),
};

export const makeWorker = (table) => Object.freeze({
  worker: pw,
  put: entry => wrapper.put(table, entry),
  get: query => wrapper.get(table, query),
  getFieldInEntry: (query, field) => wrapper.getFieldInEntry(table, query, field),
  getFieldKeyLength: (query, field) => wrapper.getFieldKeyLength(table, query, field),
  getFieldKeys: (query, field) => wrapper.getFieldKeys(table, query, field),
  getById: (query, field, id) => wrapper.getById(table, query, field, id),
  getDbStats: (query) => pw.postMessage({
    command: 'getDbStats',
    args: [table, query],
  }),
});

export function makeMultidexWorker (moduleName) {
  const miniDbCommand = `getMiniDb${moduleName[0].toUpperCase().concat(moduleName.slice(1))}`;
  return {
    ...makeWorker(moduleName),
    getById: (server, id) => wrapper.getById(moduleName, { server }, 'data', id),
    getMiniDb: (server, searchQuery = {}) => wrapper.worker.postMessage({ command: miniDbCommand, args: [server, searchQuery] }),
  };
}

export default wrapper;
