import {
  getEffectListInUnit,
  defaultFitsQuery,
  getBurstEffects,
} from './utils';

function defaultDbFilter (currentDb = {}, searchQuery = {}) {
  const {
    keys = Object.keys(currentDb),
    procs = [],
    passives = [],
  } = searchQuery;
  return keys.filter(key => currentDb.hasOwnProperty(key) && defaultFitsQuery(currentDb[key], procs, passives));
}

async function getterWrapper (table, server = 'gl', dbWrapper, getResults = (db = {}) => Promise.resolve(Object.keys(db))) {
  const results = await dbWrapper.get({ table, query: { server } });
  if (results.length === 0 || !results[0].data || Object.keys(results[0].data).length === 0) {
    return [];
  } else {
    return getResults(results[0].data);
  }
}

export function units (searchQuery = {}, server = 'gl', dbWrapper) {
  return getterWrapper('units', server, dbWrapper, (currentDb) => {
    const {
      keys = Object.keys(currentDb),
      procAreas = ['ls', 'es', 'sp', 'bb', 'sbb', 'ubb'],
      passiveAreas = ['ls', 'es', 'sp', 'bb', 'sbb', 'ubb'],
      procs = [],
      passives = [],
    } = searchQuery;

     const hasAllGivenProcs = (unit) => {
      const allProcs = procAreas.map(area => getEffectListInUnit(unit, area).map(e => e['proc id'] || e['unknown proc id'])).reduce((acc, val) => acc.concat(val), []);
      return procs.every(id => allProcs.includes(id));
    };
    const hasAllGivenPassives = (unit) => {
      const allPassives = passiveAreas.map(area => getEffectListInUnit(unit, area).map(e => e['passive id'] || e['unknown passive id'])).reduce((acc, val) => acc.concat(val), []);
      return passives.every(id => allPassives.includes(id));
    };
    const fitsUnitQuery = (unit) => {
      if (procs.length === 0 && passives.length === 0) {
        return true;
      }

      const hasProcAreas = procs.length === 0 || hasAllGivenProcs(unit);
      const hasPassiveAreas = passives.length === 0 || hasAllGivenPassives(unit);

      return hasProcAreas && hasPassiveAreas;
    };
    return keys.filter(key => currentDb.hasOwnProperty(key) && fitsUnitQuery(currentDb[key]));
  });
}

export function items (searchQuery = {}, server = 'gl', dbWrapper) {
  return getterWrapper('items', server, dbWrapper, (currentDb) => defaultDbFilter(currentDb, searchQuery));
}

export function bursts (searchQuery = {}, server = 'gl', dbWrapper) {
  return getterWrapper('bursts', server, dbWrapper, (currentDb) => {
    const {
      keys = Object.keys(currentDb),
      procs = [],
      passives = [],
    } = searchQuery;
    const fitsQuery = (entry) => {
      if (procs.length === 0 && passives.length === 0) {
        return true;
      }

       const allProcs = getBurstEffects(entry).map(e => e['proc id'] || e['unknown proc id']);
      const hasProcAreas = procs.length === 0 || procs.every(id => allProcs.includes(id));

       const allPassives = getBurstEffects(entry).map(e => e['passive id'] || e['unknown passive id']);
      const hasPassiveAreas = passives.length === 0 || passives.every(id => allPassives.includes(id));

       return hasProcAreas && hasPassiveAreas;
    };
    return keys.filter(key => currentDb.hasOwnProperty(key) && fitsQuery(currentDb[key]));
  });
}

export function extraSkills (searchQuery = {}, server = 'gl', dbWrapper) {
  return getterWrapper('extraSkills', server, dbWrapper, (currentDb) => defaultDbFilter(currentDb, searchQuery));
}

export function leaderSkills (searchQuery = {}, server = 'gl', dbWrapper) {
  return getterWrapper('leaderSkills', server, dbWrapper, (currentDb) => defaultDbFilter(currentDb, searchQuery));
}

// eslint-disable-next-line no-unused-vars
export function missions (searchQuery = {}, server = 'gl', dbWrapper) {
  // TODO: search based on search query
  return getterWrapper('missions', server, dbWrapper);
}

// eslint-disable-next-line no-unused-vars
export function dictionary (searchQuery = {}, server = 'gl', dbWrapper) {
  // TODO: search based on search query
  return getterWrapper('dictionary', server, dbWrapper);
}
