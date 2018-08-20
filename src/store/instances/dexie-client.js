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
    args: [table, query]
  }),
});

export const unitWorker = Object.freeze({
  ...makeWorker('units'),
  getById: (server, id) => wrapper.getById('units', { server }, 'data', id),
  getMiniDb: (server, searchQuery = {}) => wrapper.worker.postMessage({ command: 'getMiniDbUnits', args: [server, searchQuery] }),
});

export const itemWorker = Object.freeze({
  ...makeWorker('items'),
  getById: (server, id) => wrapper.getById('items', { server }, 'data', id),
  getMiniDb: (server, searchQuery = {}) => wrapper.worker.postMessage({ command: 'getMiniDbItems', args: [server, searchQuery] }),
});

export const burstWorker = Object.freeze({
  ...makeWorker('bursts'),
  getById: (server, id) => wrapper.getById('bursts', { server }, 'data', id),
  getMiniDb: (server, searchQuery = {}) => wrapper.worker.postMessage({ command: 'getMiniDbBursts', args: [server, searchQuery] }),
});

export const extraSkillWorker = Object.freeze({
  ...makeWorker('extraSkills'),
  getById: (server, id) => wrapper.getById('extraSkills', { server }, 'data', id),
  getMiniDb: (server, searchQuery = {}) => wrapper.worker.postMessage({ command: 'getMiniDbExtraSkills', args: [server, searchQuery] }),
});

export const leaderSkillWorker = Object.freeze({
  ...makeWorker('leaderSkills'),
  getById: (server, id) => wrapper.getById('leaderSkills', { server }, 'data', id),
  getMiniDb: (server, searchQuery = {}) => wrapper.worker.postMessage({ command: 'getMiniDbLeaderSkills', args: [server, searchQuery] }),
});

export const missionWorker = Object.freeze({
  ...makeWorker('missions'),
  getById: (server, id) => wrapper.getById('missions', { server }, 'data', id),
  getMiniDb: (server, searchQuery = {}) => wrapper.worker.postMessage({ command: 'getMiniDbMissions', args: [server, searchQuery] }),
});

export const dictionaryWorker = Object.freeze({
  ...makeWorker('dictionary'),
  getById: (server, id) => wrapper.getById('dictionary', { server }, 'data', id),
  getMiniDb: (server, searchQuery = {}) => wrapper.worker.postMessage({ command: 'getMiniDbDictionary', args: [server, searchQuery] }),
});

export default wrapper;
