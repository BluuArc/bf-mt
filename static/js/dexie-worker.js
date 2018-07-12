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
}).upgrade(transaction => {
  console.debug('[PW-dexie] using schema version 3');
  return transaction;
});

const defaultFitsQuery = (entry, procs, passives) => {
  if (procs.length === 0 && passives.length === 0) {
    return true;
  }

  const allProcs = defaultGetEffects(entry).map(e => e['proc id'] || e['unknown proc id']);
  const hasProcAreas = procs.length === 0 || procs.every(id => allProcs.includes(id));

  const allPassives = defaultGetEffects(entry).map(e => e['passive id'] || e['unknown passive id']);
  const hasPassiveAreas = passives.length === 0 || passives.every(id => allPassives.includes(id));

  return hasProcAreas && hasPassiveAreas;
};

const getExtraTriggeredEffects = (effect) => {
  return effect['triggered effect'] || [];
};

const defaultGetEffects = (obj = {}) => {
  const effects = obj.effects || (obj.effect && obj.effect.effect) || obj.effect || [];
  return effects.concat(effects.map(getExtraTriggeredEffects).reduce((acc, val) => Array.isArray(val) ? acc.concat(val) : acc.concat([val]), []));
};

const getBuffListFromSpSkill = (skill) => {
  const buffs = [];
  skill.skill.effects.forEach(entry => {
    Object.keys(entry).forEach(type => {
      buffs.push(entry[type]);
    });
  });
  return buffs.concat(buffs.map(getExtraTriggeredEffects).reduce((acc, val) => Array.isArray(val) ? acc.concat(val) : acc.concat([val]), []));
};

const getBurstEffects = (burst) => {
  const endLevelObject = burst.levels[burst.levels.length - 1];
  return defaultGetEffects(endLevelObject);
};

const unitLocations = {
  ls: (unit) => defaultGetEffects(unit['leader skill']),
  es: (unit) => defaultGetEffects(unit['extra skill']),
  sp: (unit) => {
    if (!unit.feskills) {
      return [];
    }
    const feskills = unit.feskills
      .map(getBuffListFromSpSkill)
      .reduce((acc, val) => acc.concat(val), []);
    return feskills;
  },
  bb: (unit) => !unit.bb ? [] : getBurstEffects(unit.bb),
  sbb: (unit) => !unit.sbb ? [] : getBurstEffects(unit.sbb),
  ubb: (unit) => !unit.ubb ? [] : getBurstEffects(unit.ubb),
};

function getEffectListInUnit (unit, location) {
  return (unitLocations[location] || defaultGet)(unit);
}

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

      const { procAreas = ['ls', 'es', 'sp', 'bb', 'sbb', 'ubb'], passiveAreas = ['ls', 'es', 'sp', 'bb', 'sbb', 'ubb'], procs = [], passives = [] } = searchQuery;
      // console.debug(procAreas, passiveAreas, procs, passives);
      const fitsUnitQuery = (unit) => {
        if (procs.length === 0 && passives.length === 0) {
          return true;
        }

        const allProcs = procAreas.map(area => getEffectListInUnit(unit, area).map(e => e['proc id'] || e['unknown proc id'])).reduce((acc, val) => acc.concat(val), []);
        const hasProcAreas = procs.length === 0 || procs.every(id => allProcs.includes(id));

        const allPassives = passiveAreas.map(area => getEffectListInUnit(unit, area).map(e => e['passive id'] || e['unknown passive id'])).reduce((acc, val) => acc.concat(val), []);
        const hasPassiveAreas = passives.length === 0 || passives.every(id => allPassives.includes(id));

        return hasProcAreas && hasPassiveAreas;
      };

      const currentDb = results[0].data;
      const resultDb = {};
      Object.keys(currentDb)
      .forEach(key => {
        if (fitsUnitQuery(currentDb[key])) {
          const { cost, element, gender, guide_id, id, name, rarity, next, prev, evo_mats, kind } = currentDb[key];
          resultDb[key] = { cost, element, gender, guide_id, id, name, rarity, next, prev, evo_mats, kind };
        }
      });

      return resultDb;
    }),
  getMiniDbItems: (server, searchQuery = {}) => defaultGet('items', { server })
    .then(results => {
      if (results.length === 0 || !results[0].data || Object.keys(results[0].data).length === 0) {
        return {};
      }

      const { procs = [], passives = [] } = searchQuery;
      // console.debug(procAreas, passiveAreas, procs, passives);

      const currentDb = results[0].data;
      const resultDb = {};
      Object.keys(currentDb)
      .forEach(key => {
        if (defaultFitsQuery(currentDb[key], procs, passives)) {
          const { desc, id, name, rarity, thumbnail, type, raid, max_stack, sell_price, recipe, usage, associated_units } = currentDb[key];
          resultDb[key] = { desc, id, name, rarity, thumbnail, type, raid, max_stack, sell_price, recipe, usage, associated_units, 'sphere type': currentDb[key]['sphere type'] };
        }
      });

      return resultDb;
    }),
  getMiniDbBursts: (server, searchQuery = {}) => defaultGet('bursts', { server })
    .then(results => {
      if (results.length === 0 || !results[0].data || Object.keys(results[0].data).length === 0) {
        return {};
      }

      const { procs = [], passives = [] } = searchQuery;

      const fitsQuery = (entry, procs, passives) => {
        if (procs.length === 0 && passives.length === 0) {
          return true;
        }

        const allProcs = getBurstEffects(entry).map(e => e['proc id'] || e['unknown proc id']);
        const hasProcAreas = procs.length === 0 || procs.every(id => allProcs.includes(id));

        const allPassives = getBurstEffects(entry).map(e => e['passive id'] || e['unknown passive id']);
        const hasPassiveAreas = passives.length === 0 || passives.every(id => allPassives.includes(id));

        return hasProcAreas && hasPassiveAreas;
      };

      const currentDb = results[0].data;
      const resultDb = {};
      Object.keys(currentDb)
      .forEach(key => {
        if (fitsQuery(currentDb[key], procs, passives)) {
          const { desc, id, name, associated_units } = currentDb[key];
          resultDb[key] = { desc, id, name, associated_units };
        }
      });

      return resultDb;
    }),
  getMiniDbExtraSkills: (server, searchQuery = {}) => defaultGet('extraSkills', { server })
    .then(results => {
      if (results.length === 0 || !results[0].data || Object.keys(results[0].data).length === 0) {
        return {};
      }
      const { procs = [], passives = [] } = searchQuery;
      const currentDb = results[0].data;
      const resultDb = {};
      Object.keys(currentDb)
      .forEach(key => {
        if (defaultFitsQuery(currentDb[key], procs, passives)) {
          const { desc, id, name, associated_units, rarity } = currentDb[key];
          resultDb[key] = { desc, id, name, associated_units, rarity };
        }
      });

      return resultDb;
    }),
  getMiniDbLeaderSkills: (server, searchQuery = {}) => defaultGet('leaderSkills', { server })
    .then(results => {
      if (results.length === 0 || !results[0].data || Object.keys(results[0].data).length === 0) {
        return {};
      }

      const { procs = [], passives = [] } = searchQuery;
      const currentDb = results[0].data;
      const resultDb = {};
      Object.keys(currentDb)
      .forEach(key => {
        if (defaultFitsQuery(currentDb[key], procs, passives)) {
          const { desc, id, name, associated_units } = currentDb[key];
          resultDb[key] = { desc, id, name, associated_units };
        }
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
  getMiniDbDictionary: (server, searchQuery = {}) => defaultGet('dictionary', { server })
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
