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
  extraSkiils: defaultSchema,
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
