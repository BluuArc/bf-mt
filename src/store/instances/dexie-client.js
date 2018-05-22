const PromiseWorker = require('promise-worker');
const worker = new Worker('static/js/dexie-worker.js');
const pw = new PromiseWorker(worker);

const wrapper = {
  worker: pw,
  put: (table, entry) => pw.postMessage({ command: 'put', args: [table, entry] }),
  get: (table, query) => pw.postMessage({ command: 'get', args: [table, query] }),
  getFieldInEntry: (table, query, field) => pw.postMessage({ command: 'getFieldInEntry', args: [table, query, field] }),
  getFieldKeyLength: (table, query, field) => pw.postMessage({ command: 'getFieldKeyLength', args: [table, query, field] }),
  getById: (table, query, field, id) => pw.postMessage({ command: 'getById', args: [table, query, field, id] }),
  setTable: makeWorker,
};

function makeWorker (table) {
  const baseWorker = {
    worker: pw,
    put: entry => wrapper.put(table, entry),
    get: query => wrapper.get(table, query),
    getFieldInEntry: (query, field) => wrapper.getFieldInEntry(table, query, field),
    getFieldKeyLength: (query, field) => wrapper.getFieldKeyLength(table, query, field),
    getById: (query, field, id) => wrapper.getById(table, query, field, id),
  };

  return baseWorker;
}

export const unitWorker = {
  ...makeWorker('units'),
  getById: (server, id) => wrapper.getById('units', { server }, 'data', id),
  getUnitsMini: (server, searchQuery = {}) => wrapper.worker.postMessage({ command: 'getUnitsMini', args: [server, searchQuery] }),
};

export const itemWorker = {
  ...makeWorker('items'),
  getById: (server, id) => wrapper.getById('items', { server }, 'data', id),
  getItemsMini: (server, searchQuery = {}) => wrapper.worker.postMessage({ command: 'getItemsMini', args: [server, searchQuery] }),
};

export default wrapper;
