import Dexie from 'dexie';
import logger from './logger';

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
  logger.debug('[DEXIE] using schema version 2');
  return transaction;
});

db.version(3).stores({
  missions: defaultSchemas[2],
  dictionary: defaultSchemas[2],
}).upgrade(transaction => {
  logger.debug('[DEXIE] using schema version 3');
  return transaction;
});

db.version(4).stores({
  commmits: '&branch,data',
}).upgrade(transaction => {
  logger.debug('[DEXIE] using schema version 4');
  return transaction;
});

db.version(4.1).stores({
  commmits: null, // delete old table
  commits: '&user,data',
}).upgrade(transaction => {
  logger.debug('[DEXIE] using schema version 4.1');
  return transaction;
});

db.version(5).stores({
  squads: '++id,squad',
});

db.version(5.1).stores({
  squads: '++id,server,squad',
});

export default db;
