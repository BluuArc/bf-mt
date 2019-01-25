import {
  getEffectListInUnit,
  fitsBuffQuery,
  getBurstEffects,
  parseNames,
  fitsTernary,
} from './utils';

import {
  elements as allElements,
  unitKinds as allUnitKinds,
  genders as allGenders,
  buffSearchOptions,

  itemTypes as allItemTypes,
  sphereTypeMapping,
  defaultTernaryOptions,
  craftableFilterOptions,
  usageFilterOptions,
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
      elements = allElements.slice(),
      rarity = (new Array(8)).fill(0).map((_, i) => i + 1),
      unitKinds = allUnitKinds.slice(),
      genders = allGenders.slice(),
    } = searchQuery;
    const names = parseNames(name);

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

export function items (searchQuery, server = 'gl', dbWrapper) {
  return getterWrapper('items', server, dbWrapper, (currentDb) => {
    if (typeof searchQuery === 'undefined' || Object.keys(searchQuery).length === 0) {
      return Object.keys(currentDb);
    }

    const {
      keys = Object.keys(currentDb),
      procs = [],
      passives = [],
      name = '',
      rarity = (new Array(9)).fill(0).map((_, i) => i),
      itemTypes = allItemTypes.slice(),
      sphereTypes = Object.keys(sphereTypeMapping).map((_, i) => i),
      associatedUnits = defaultTernaryOptions.allValue,
      craftables = craftableFilterOptions.allValue,
      usage = usageFilterOptions.allValue,
    } = searchQuery;
    // trim off the spaces of subsequent names
    const names = parseNames(name);
    const includeNoneSphereType = sphereTypes.includes(0);
    const includeAnySphereType = sphereTypes.length === 15;

    const fitsItemQuery = (key) => {
      const entry = currentDb[key];
      const fitsName = (!name ? true : names.filter(n => entry.name.toLowerCase().includes(n)).length > 0);
      const fitsID = (!name ? true : names.filter(n => key.toString().toLowerCase().includes(n) || (entry.id || '').toString().includes(n)).length > 0);
      const fitsRarity = rarity.includes(entry.rarity);
      const fitsItemType = itemTypes.includes(entry.type) || (itemTypes.includes('raid') && entry.raid);

      const hasSphereType = entry['sphere type'] !== undefined || entry.type === 'sphere' || entry.type === 'ls_sphere';
      const fitsSphereType = includeAnySphereType ||
        (hasSphereType && (sphereTypes.includes(entry['sphere type']))) ||
        (includeNoneSphereType && !entry['sphere type']);

      const hasAssociatedUnits = Array.isArray(entry.associated_units) && entry.associated_units.length > 0;
      const fitsAssociatedUnits = fitsTernary(hasAssociatedUnits, associatedUnits);

      const isCraftable = !!entry.recipe;
      const fitsCraftable = fitsTernary(isCraftable, craftables, craftableFilterOptions);

      const isUsed = !!entry.usage && entry.usage.length > 0;
      const fitsUsage = fitsTernary(isUsed, usage, usageFilterOptions);

      return [fitsName || fitsID, fitsItemType, fitsRarity, fitsSphereType, fitsAssociatedUnits, fitsCraftable, fitsUsage].every(val => val);
    };
    return keys.filter(
      key => currentDb.hasOwnProperty(key) &&
        fitsBuffQuery(currentDb[key], procs, passives) &&
        fitsItemQuery(key)
    );
  });
}

export function bursts (searchQuery, server = 'gl', dbWrapper) {
  return getterWrapper('bursts', server, dbWrapper, (currentDb) => {
    if (typeof searchQuery === 'undefined' || Object.keys(searchQuery).length === 0) {
      return Object.keys(currentDb);
    }

    const {
      keys = Object.keys(currentDb),
      procs = [],
      passives = [],
      name = '',
      associatedUnits = defaultTernaryOptions.allValue,
    } = searchQuery;
    const names = parseNames(name);
    const fitsBurstBuffQuery = (entry) => fitsBuffQuery(
      entry,
      procs,
      passives,
      (entry) => getBurstEffects(entry),
      (entry) => getBurstEffects(entry),
    );

    const fitsBurstQuery = (key) => {
      const entry = currentDb[key];
      const fitsName = (!name ? true : names.filter(n => entry.name.toLowerCase().includes(n)).length > 0);
      const fitsID = (!name ? true : names.filter(n => key.toString().toLowerCase().includes(n) || (entry.id || '').toString().includes(n)).length > 0);

      const hasAssociatedUnits = Array.isArray(entry.associated_units) && entry.associated_units.length > 0;
      const fitsAssociatedUnits = fitsTernary(hasAssociatedUnits, associatedUnits, defaultTernaryOptions);

      return [fitsName || fitsID, fitsAssociatedUnits].every(val => val);
    };
    return keys.filter(key => currentDb.hasOwnProperty(key) &&
      fitsBurstBuffQuery(currentDb[key]) &&
      fitsBurstQuery(key)
    );
  });
}

export function extraSkills (searchQuery, server = 'gl', dbWrapper) {
  return getterWrapper('extraSkills', server, dbWrapper, (currentDb) => {
    if (typeof searchQuery === 'undefined' || Object.keys(searchQuery).length === 0) {
      return Object.keys(currentDb);
    }

    const {
      keys = Object.keys(currentDb),
      procs = [],
      passives = [],
      name = '',
      rarity = (new Array(9)).fill(0).map((_, i) => i),
      associatedUnits = defaultTernaryOptions.allValue,
    } = searchQuery;
    const names = parseNames(name);
    const fitsSkillBuffQuery = (entry) => fitsBuffQuery(
      entry,
      procs,
      passives,
    );

    const fitsSkillQuery = (key) => {
      const entry = currentDb[key];
      const fitsName = (!name ? true : names.filter(n => entry.name.toLowerCase().includes(n)).length > 0);
      const fitsID = (!name ? true : names.filter(n => key.toString().toLowerCase().includes(n) || (entry.id || '').toString().includes(n)).length > 0);
      const fitsRarity = rarity.includes(+entry.rarity);

      const hasAssociatedUnits = Array.isArray(entry.associated_units) && entry.associated_units.length > 0;
      const fitsAssociatedUnits = fitsTernary(hasAssociatedUnits, associatedUnits, defaultTernaryOptions);

      return [fitsName || fitsID, fitsRarity, fitsAssociatedUnits].every(val => val);
    };
    return keys.filter(key => currentDb.hasOwnProperty(key) &&
      fitsSkillBuffQuery(currentDb[key]) &&
      fitsSkillQuery(key)
    );
  });
}

export function leaderSkills (searchQuery, server = 'gl', dbWrapper) {
  return getterWrapper('leaderSkills', server, dbWrapper, (currentDb) => {
    if (typeof searchQuery === 'undefined' || Object.keys(searchQuery).length === 0) {
      return Object.keys(currentDb);
    }

    const {
      keys = Object.keys(currentDb),
      procs = [],
      passives = [],
      name = '',
      associatedUnits = defaultTernaryOptions.allValue,
    } = searchQuery;
    const names = parseNames(name);
    const fitsSkillBuffQuery = (entry) => fitsBuffQuery(
      entry,
      procs,
      passives,
    );

    const fitsSkillQuery = (key) => {
      const entry = currentDb[key];
      const fitsName = (!name ? true : names.filter(n => entry.name.toLowerCase().includes(n)).length > 0);
      const fitsID = (!name ? true : names.filter(n => key.toString().toLowerCase().includes(n) || (entry.id || '').toString().includes(n)).length > 0);

      const hasAssociatedUnits = Array.isArray(entry.associated_units) && entry.associated_units.length > 0;
      const fitsAssociatedUnits = fitsTernary(hasAssociatedUnits, associatedUnits, defaultTernaryOptions);

      return [fitsName || fitsID, fitsAssociatedUnits].every(val => val);
    };
    return keys.filter(key => currentDb.hasOwnProperty(key) &&
      fitsSkillBuffQuery(currentDb[key]) &&
      fitsSkillQuery(key)
    );
  });
}

// eslint-disable-next-line no-unused-vars
export function missions (searchQuery, server = 'gl', dbWrapper) {
  // TODO: search based on search query
  return getterWrapper('missions', server, dbWrapper);
}

// eslint-disable-next-line no-unused-vars
export function dictionary (searchQuery, server = 'gl', dbWrapper) {
  // TODO: search based on search query
  return getterWrapper('dictionary', server, dbWrapper);
}
