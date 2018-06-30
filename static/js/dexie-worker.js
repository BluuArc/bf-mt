// reference: https://github.com/nolanlawson/promise-worker
/* global Dexie importScripts, registerPromiseWorker */
importScripts('./dexie.min-2.0.4.js');
importScripts('./promise-worker.register.min-1.1.1.js');

const db = new Dexie('bf-mt');
const defaultSchemas = {
  1: '&server,data,updateTime',
  2: '&server,data,updateTime,cacheTime',
};

db.version(1).stores({
  units: defaultSchemas[1],
  items: defaultSchemas[1],
  bursts: defaultSchemas[1],
  extraSkills: defaultSchemas[1],
  leaderSkills: defaultSchemas[1],
  settings: '&user,data',
});

db.version(2).stores({
  units: defaultSchemas[2],
  items: defaultSchemas[2],
  bursts: defaultSchemas[2],
  extraSkills: defaultSchemas[2],
  leaderSkills: defaultSchemas[2],
}).upgrade(transaction => {
  console.debug('[PW-dexie] using schema version 2');
  return transaction;
});

db.version(3).stores({
  missions: defaultSchemas[2],
  dictionary: defaultSchemas[2],
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
  getFieldKeys: (table, whereQuery, fieldName) => defaultGet(table, whereQuery)
    .then(results => {
      return (results.length === 0) ? 0 : Object.keys(results[0][fieldName]);
    }),
  getById: (table, query, field, id) => defaultGet(table, query)
    .then(results => {
      return (results.length === 0) ? undefined : (results[0][field] ? results[0][field][id] : undefined);
    }),
  getDbStats: (table, query) => defaultGet(table, query)
    .then(results => {
      if (results.length === 0) {
        return undefined;
      }

      try {
        const { data, updateTime, cacheTime } = results[0];
        return { keyLength: Object.keys(data).length, updateTime, cacheTime };
      } catch (err) {
        console.error(err);
        return undefined;
      }
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
        // TODO: search based on search query
        const { cost, element, gender, guide_id, id, name, rarity, next, prev, evo_mats, kind } = currentDb[key];
        resultDb[key] = { cost, element, gender, guide_id, id, name, rarity, next, prev, evo_mats, kind };
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
        // TODO: search based on search query
        const { desc, id, name, rarity, thumbnail, type, raid, max_stack, sell_price, recipe, usage, associated_units } = currentDb[key];
        resultDb[key] = { desc, id, name, rarity, thumbnail, type, raid, max_stack, sell_price, recipe, usage, associated_units, 'sphere type': currentDb[key]['sphere type'] };
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
        // TODO: search based on search query
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
        // TODO: search based on search query
        // TODO: find a way to get buff lists/icons? (maybe not?)
        const { desc, id, name, associated_units, rarity } = currentDb[key];
        resultDb[key] = { desc, id, name, associated_units, rarity };
      });

      return resultDb;
    }),
  getMiniDbLeaderSkills: (server, searchQuery = {}) => defaultGet('leaderSkills', { server })
    .then(results => {
      if (results.length === 0 || !results[0].data || Object.keys(results[0].data).length === 0) {
        return {};
      }

      const currentDb = results[0].data;
      const resultDb = {};
      Object.keys(currentDb)
      .forEach(key => {
        // TODO: search based on search query
        // TODO: find a way to get buff lists/icons? (maybe not?)
        const { desc, id, name, associated_units } = currentDb[key];
        resultDb[key] = { desc, id, name, associated_units };
      });

      return resultDb;
    }),
  getMiniDbMissions: (server, searchQuery = {}) => defaultGet('missions', { server })
    .then(results => {
      if (results.length === 0 || !results[0].data || Object.keys(results[0].data).length === 0) {
        return {};
      }

      const currentDb = results[0].data;
      // const resultDb = {};
      // TODO: search based on search query
      // no need to create mini version
      return currentDb;
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
