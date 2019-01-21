import {
  getEffectListInUnit,
  fitsBuffQuery,
  getBurstEffects,
} from './utils';

import { 
  buffSearchOptions,
} from '@/modules/constants';


function defaultDbFilter (currentDb = {}, searchQuery) {
  if (typeof searchQuery === 'undefined' || Object.keys(searchQuery).length === 0) {
    return Object.keys(currentDb);
  }
  const {
    keys = Object.keys(currentDb),
    procs = [],
    passives = [],
  } = searchQuery;
  return keys.filter(key => currentDb.hasOwnProperty(key) && fitsBuffQuery(currentDb[key], procs, passives));
}

async function getterWrapper (table, server = 'gl', dbWrapper, getResults = defaultDbFilter) {
  const results = await dbWrapper.get({ table, query: { server } });
  if (results.length === 0 || !results[0].data || Object.keys(results[0].data).length === 0) {
    return {
      keys: [],
      fullDb: {},
    };
  } else {
    return {
      keys: getResults(results[0].data),
      fullDb: results[0].data,
    };
  }
}

export function units (searchQuery, server = 'gl', dbWrapper) {
  return getterWrapper('units', server, dbWrapper, (currentDb) => {
    if (typeof searchQuery === 'undefined' || Object.keys(searchQuery).length === 0) {
      return Object.keys(currentDb);
    }

    const {
      keys = Object.keys(currentDb),
      procBuffSearchOptions = buffSearchOptions.slice(),
      passiveBuffSearchOptions = buffSearchOptions.slice(),
      procs = [],
      passives = [],
      name = '',
      elements = [],
      rarity = [],
      unitKinds = [],
      genders = [],
    } = searchQuery;
    // trim off the spaces of subsequent names
    const names = (name || '').split('|').filter((v, i) => i === 0 || v.trim()).map(n => n.toLowerCase());

    const fitsUnitBuffQuery = (unit) => fitsBuffQuery(
      unit,
      procs,
      passives,
      (unit) => procBuffSearchOptions.map(area =>getEffectListInUnit(unit, area)).reduce((acc, val) => acc.concat(val), []),
      (unit) => passiveBuffSearchOptions.map(area =>getEffectListInUnit(unit, area)).reduce((acc, val) => acc.concat(val), [])
    );

    const fitsUnitQuery = (key) => {
      const entry = currentDb[key];
      const fitsName = (!name ? true : names.filter(n => entry.name.toLowerCase().includes(n)).length > 0);
      const fitsID = (!name ? true : names.filter(n => key.toString().toLowerCase().includes(n) || (entry.id || '').toString().includes(n)).length > 0);
      const fitsElement = elements.includes(entry.element);
      const fitsRarity = rarity.includes(entry.rarity);
      const fitsGender = genders.includes(entry.gender);

      // need to flip evo/enhancing as they're marked wrong in the data at time of writing
      // default to enhancing so that Omni Frog and Omni Emperor aren't hidden by default
      const kindEntry = (entry.kind === 'evo' ? 'enhancing' : entry.kind === 'enhancing' ? 'evolution' : entry.kind) || 'enhancing';
      const fitsKind = unitKinds.includes(kindEntry);

      return [fitsName || fitsID, fitsElement, fitsRarity, fitsKind, fitsGender].every(val => val);
    };
    return keys.filter(
      key => currentDb.hasOwnProperty(key) &&
        fitsUnitBuffQuery(currentDb[key]) &&
        fitsUnitQuery(key)
    );
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
    const fitsQuery = (entry) => fitsBuffQuery(
      entry,
      procs,
      passives,
      (entry) => getBurstEffects(entry),
      (entry) => getBurstEffects(entry),
    );
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
