// reference: https://github.com/nolanlawson/promise-worker
/* global Dexie importScripts, registerPromiseWorker */
importScripts('https://unpkg.com/dexie@latest/dist/dexie.js');
importScripts('https://unpkg.com/promise-worker/dist/promise-worker.register.js');

const db = new Dexie('bf-mt');
const defaultSchema = '&server,data,updateTime';
db.version(1).stores({
  units: defaultSchema,
  items: defaultSchema,
  bursts: defaultSchema,
  extraSkills: defaultSchema,
  leaderSkills: defaultSchema,
  settings: '&user,data',
});

const defaultGet = (table, whereQuery) => db[table].where(whereQuery).toArray();

const dbWrapper = {
  put: (table, entry) => db[table].put(entry),
  get: defaultGet,
  getFieldInEntry: (table, whereQuery, fieldName) => defaultGet(table, whereQuery)
    .then(results => {
      return (results.length === 0) ? undefined : results[0][fieldName];
    }),
  getFieldKeyLength: (table, whereQuery, fieldName) => defaultGet(table, whereQuery)
    .then(results => {
      return (results.length === 0) ? 0 : Object.keys(results[0][fieldName]).length;
    }),
  getById: (table, query, field, id) => defaultGet(table, query)
    .then(results => {
      return (results.length === 0) ? undefined : (results[0][field] ? results[0][field][id] : undefined);
    }),
  getMiniDbUnits: (server, searchQuery = {}) => defaultGet('units', { server })
    .then(results => {
      if (results.length === 0 || !results[0].data || Object.keys(results[0].data).length === 0) {
        return {};
      }

      const currentDb = results[0].data;
      const resultDb = {};
      Object.keys(currentDb)
      .forEach(key => {
        // TODO: search units based on search query
        const { cost, element, gender, guide_id, id, name, rarity } = currentDb[key];
        resultDb[key] = { cost, element, gender, guide_id, id, name, rarity };
      });

      return resultDb;
    }),
  getMiniDbItems: (server, searchQuery = {}) => defaultGet('items', { server })
    .then(results => {
      if (results.length === 0 || !results[0].data || Object.keys(results[0].data).length === 0) {
        return {};
      }

      const currentDb = results[0].data;
      const resultDb = {};
      Object.keys(currentDb)
      .forEach(key => {
        // TODO: search units based on search query
        const { desc, id, name, rarity, thumbnail, type } = currentDb[key];
        resultDb[key] = { desc, id, name, rarity, thumbnail, type };
      });

      return resultDb;
    }),
  getMiniDbBursts: (server, searchQuery = {}) => defaultGet('bursts', { server })
    .then(results => {
      if (results.length === 0 || !results[0].data || Object.keys(results[0].data).length === 0) {
        return {};
      }

      const currentDb = results[0].data;
      const resultDb = {};
      Object.keys(currentDb)
      .forEach(key => {
        // TODO: search units based on search query
        // TODO: find a way to get buff lists/icons? (maybe not?)
        const { desc, id, name, associated_units } = currentDb[key];
        resultDb[key] = { desc, id, name, associated_units };
      });

      return resultDb;
    }),
  getMiniDbExtraSkills: (server, searchQuery = {}) => defaultGet('extraSkills', { server })
    .then(results => {
      if (results.length === 0 || !results[0].data || Object.keys(results[0].data).length === 0) {
        return {};
      }

      const currentDb = results[0].data;
      const resultDb = {};
      Object.keys(currentDb)
      .forEach(key => {
        // TODO: search units based on search query
        // TODO: find a way to get buff lists/icons? (maybe not?)
        const { desc, id, name, associated_units, rarity } = currentDb[key];
        resultDb[key] = { desc, id, name, associated_units, rarity };
      });

      return resultDb;
    }),
};

registerPromiseWorker(async ({ command, args = [] }) => {
  console.debug('[PW-dexie] received message', { command, args });
  if (dbWrapper.hasOwnProperty(command)) {
    const result = await dbWrapper[command](...args);
    console.debug('[PW-dexie] result', result);
    return Promise.resolve(result);
  } else {
    return Promise.resolve({ error: 'unknown command' });
  }
});
