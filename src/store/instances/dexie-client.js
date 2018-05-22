const PromiseWorker = require('promise-worker');
const worker = new Worker('static/js/dexie-worker.js');
const pw = new PromiseWorker(worker);

const wrapper = {
  worker: pw,
  put: (table, entry) => pw.postMessage({ command: 'put', args: [table, entry] }),
  get: (table, query) => pw.postMessage({ command: 'get', args: [table, query] }),
  getFieldInEntry: (table, query, field) => pw.postMessage({ command: 'getFieldInEntry', args: [table, query, field] }),
  getFieldKeyLength: (table, query, field) => pw.postMessage({ command: 'getFieldKeyLength', args: [table, query, field] }),
  setTable: (table) => ({
    worker: pw,
    put: entry => pw.postMessage({ command: 'put', args: [table, entry] }),
    get: query => pw.postMessage({ command: 'get', args: [table, query] }),
    getFieldInEntry: (query, field) => pw.postMessage({ command: 'getFieldInEntry', args: [table, query, field] }),
    getFieldKeyLength: (query, field) => pw.postMessage({ command: 'getFieldKeyLength', args: [table, query, field] }),
  }),
};

export default wrapper;
