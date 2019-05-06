import { attackingProcs } from '@/modules/EffectProcessor/constants';
import {
  spCategoryMapping,
  moveTypeMapping,
  squadFillerMapping,
  arenaActionMapping,
  arenaTargetMapping,
  arenaConditionMapping,
} from '@/modules/constants';
import { safeGet } from '@/modules/utils';

export function getExtraAttacks (unit) {
  const extraAttacks = {
    bb: [],
    sbb: [],
    ubb: [],
  };
  if (!unit) {
    return extraAttacks;
  }

  let possibleEffects = [];
  const isAttackingPassive = e => e['passive id'] === '66' &&
    e['triggered effect'].some(triggeredEffect => attackingProcs.includes(triggeredEffect['proc id'] || triggeredEffect['unknown proc id']));
  const mapEffect = (effect, source) => {
    effect['triggered effect']
      .filter(triggeredEffect => attackingProcs.includes(triggeredEffect['proc id'] || triggeredEffect['unknown proc id']))
      .forEach(triggeredEffect => {
        possibleEffects.push({
          ...triggeredEffect,
          source,
          'trigger on bb': effect['trigger on bb'],
          'trigger on sbb': effect['trigger on sbb'],
          'trigger on ubb': effect['trigger on ubb'],
        });
      });
  };

  if (unit['extra skill']) {
    const { effects = [] } = unit['extra skill'];
    effects.filter(isAttackingPassive).forEach(e => mapEffect(e, 'ES'));
  }

  if (unit.feskills) {
    unit.feskills
      .map(s => s.skill.effects)
      .reduce((acc, val) => acc.concat(val), [])
      .filter(s => s.passive && isAttackingPassive(s.passive))
      .map(s => s.passive)
      .forEach(e => mapEffect(e, 'SP'));
  }

  possibleEffects.forEach(effect => {
    const burstTypes = Object.keys(extraAttacks);
    burstTypes.forEach(type => {
      if (effect[`trigger on ${type}`]) {
        extraAttacks[type].push(effect);
      }
    });
  });
  return extraAttacks;
}

export function getSpCategory (num) {
  return spCategoryMapping[+num];
}

export function getSpEntryEffects (spEntry = {}) {
  const effects = [];
  spEntry.skill.effects.forEach(e => {
    // distinguish between passive and add to bb/sbb/ubb
    Object.keys(e).forEach(type => {
      const effect = e[type];
      effects.push({ sp_type: type, ...effect });
    });
  });
  return effects;
}

export function getSpCost (allFeSkills, enhancements = '') {
  const isValidFeSKills = Array.isArray(allFeSkills) && allFeSkills.length > 0;
  if (!isValidFeSKills || !enhancements) {
    return 0;
  }
  return enhancements.split('')
    .map(char => allFeSkills[spCodeToIndex(char)])
    .filter(v => v)
    .reduce((acc, s) => acc + +s.skill.bp, 0);
}

export function spCodeToIndex (char) {
  return char.charCodeAt(0) - ((char < 'a') ? 'A'.charCodeAt(0) : ('a'.charCodeAt(0))) + (char < 'a' ? 0 : 26);
}

export function spIndexToCode (index) {
  return String.fromCharCode(index >= 26 ? (index - 26 + 'a'.charCodeAt(0)) : (index + 'A'.charCodeAt(0)));
}

export function spCodeToEffects (code, unitEnhancements) {
  if (!code || !Array.isArray(unitEnhancements)) {
    return [];
  }

  return code.split('')
    .map(char => unitEnhancements[spCodeToIndex(char)])
    .filter(v => v); // remove invalid entries
}

export function getSpEntryId (id = '') {
  let spId = id;
  if (typeof spId === 'object') {
    spId = id.id; // given an spEntry object
  }
  return id.includes('@')
    ? id.split('@')[1]
    : id;
}

export function getSpEntryWithId (id, spEntries = []) {
  const entryId = getSpEntryId(id);
  return spEntries.find(s => getSpEntryId(s.id).toString() === entryId);
}

export function getSpDescription (spEntry = {}) {
  const { desc = '', name = '' } = spEntry.skill;
  if (desc.trim() === name.trim()) {
    return desc || 'No Description';
  } else {
    return (desc.length > name.length)
      ? desc
      : [name, desc ? `(${desc})` : ''].filter(val => val).join(' ');
  }
}

export function getSpDependencyText (spEntry = {}, allEntries = []) {
  const dependentSpEntry = getSpEntryWithId(spEntry.dependency, allEntries);

  return dependentSpEntry
    ? `Requires "${getSpDescription(dependentSpEntry)}"`
    : (spEntry['dependency comment'] || 'Requires another enhancement');
}

export function getAllDependenciesFromSpEntry (spEntry = {}, allEntries = []) {
  const dependencies = [];
  if (spEntry.dependency) {
    const dependencyId = getSpEntryId(spEntry.dependency);
    const dependencyIndex = allEntries.findIndex(s => getSpEntryId(s.id).toString() === dependencyId);
    if (dependencyIndex > -1) {
      dependencies.push(spIndexToCode(dependencyIndex));
      const subDependencies = getAllDependenciesFromSpEntry(allEntries[dependencyIndex], allEntries);
      subDependencies.forEach(subDependency => {
        dependencies.push(subDependency);
      });
    }
  }
  return dependencies;
}

export function getAllEntriesThatDependOnSpEntry (spEntry = {}, allEntries = []) {
  const dependents = allEntries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => {
      return entry.dependency && entry.dependency.includes(spEntry.id);
    }).map(({ index }) => spIndexToCode(index));
  const subDependents = dependents.map(depCode => getAllEntriesThatDependOnSpEntry(allEntries[spCodeToIndex(depCode)], allEntries))
    .reduce((acc, val) => acc.concat(val), []);
  return Array.from(new Set(dependents.concat(subDependents)));
}

export function hasEvolutions (unit) {
  return unit && !!(unit.prev || unit.next || unit.evo_mats);
}

export async function getEvolutions (unit = {}, getUnit = (id) => ({ id })) {
  if (!hasEvolutions(unit)) {
    return [];
  }

  const evolutions = [];
  let tempUnit = unit;
  // go to first in evo line
  while (tempUnit.prev) {
    tempUnit = await Promise.resolve(getUnit(tempUnit.prev.toString()));
  }

  while (tempUnit.next) {
    evolutions.push({
      current: tempUnit.id.toString(),
      next: tempUnit.next,
      mats: tempUnit.evo_mats,
      cost: tempUnit.evo_cost,
    });
    tempUnit = await Promise.resolve(getUnit(tempUnit.next.toString()));
  }
  return evolutions;
}

export function getDropCheckInfo (unit) {
  const hasHitCounts = unit && unit['damage frames'] && unit['damage frames'].hits > 0;
  if (!hasHitCounts) {
    return { hits: 0, dropchecks: 0 };
  }

  const hits = +unit['damage frames'].hits;
  const dropCheckPerHit = +unit['drop check count'] || 0;
  return {
    hits,
    dropchecks: dropCheckPerHit * hits,
  };
}

export function getMoveType (unit, isNormalAttack = true) {
  const moveTypeCode = safeGet(unit, ['movement', isNormalAttack ? 'attack' : 'skill', 'move type']);
  return moveTypeMapping[+moveTypeCode];
}

export function evaluateSingleArenaCondition ({ condition = '', target = '' }) {
  const isParty = target === 'party';
  switch (condition) {
    case 'hp_50pr_over':
      return 'topHalf';
    case 'hp_50pr_under':
    case 'hp_75pr_under':
      return !isParty ? 'middleAndBelow' : 'beforeHealers';
    case 'hp_25pr_under':
      return !isParty ? 'bottomHalf' : 'beforeHealers';
    // other: hp_min, hp_max, atk_max, random
    default:
      break;
    }

    if (!isParty) {
      return 'anywhere';
    } else {
      switch (condition) {
        case 'hp_max':
          return 'afterHealers';
        case 'hp_min':
          return 'beforeHealers';
        default:
          return 'anywhere';
      }
    }
}

export function arenaConditionCodeToText (code) {
  const mapping = {
    topHalf: 'Top Half',
    anywhere: 'Anywhere',
    middleAndBelow: 'Middle or Lower Half',
    beforeHealers: 'Anywhere Before Healers',
    bottomHalf: 'Bottom Half',
    afterHealers: 'Anywhere After Healers',
  };
  return mapping[code];
}

export function arenaConditionToText (data = {}) {
  const chance = `${data['chance%']}% chance`;
  const action = arenaActionMapping[data.action] || data.action;
  const target = arenaTargetMapping[data['target type']] || data['target type'];
  const condition = arenaConditionMapping[data['target conditions']] || data['target conditions'];
  return `${chance} to ${action} ${target} ${condition}`;
}

export function getArenaPositionRecommendation (unit = {}) {
  const defaultSuggestion = 'anywhere';
  if (!Array.isArray(unit.ai)) {
    return [defaultSuggestion];
  }

  const skillBasedProcs = unit.ai.filter(entry => entry.action === 'skill');
  if (skillBasedProcs.length === 0) {
    return [defaultSuggestion];
  }

  const chanceMapping = {};
  skillBasedProcs.forEach(entry => {
    const condition = entry['target conditions'];
    const chance = entry['chance%'];
    const target = entry['target type'];

    if (!chanceMapping[chance]) {
      chanceMapping[chance] = [];
    }
    chanceMapping[chance].push({ condition, target });
  });

  const highestChanceConditions = Object.keys(chanceMapping)
    .sort((a, b) => +b - +a)
    .map(key => chanceMapping[key])[0];

  const positions = Array.from(new Set(highestChanceConditions.map(evaluateSingleArenaCondition)));

  return positions;
}

export function getColoClassUsage (cost = 0, isGlobal = true) {
  return [
    ((cost <= 32 && isGlobal) || (cost <= 14 && !isGlobal)) && 'Warrior',
    ((cost <= 46 && isGlobal) || (cost <= 19 && !isGlobal)) && 'Gladiator',
    ((cost <= 52 && isGlobal) || (cost <= 35 && !isGlobal)) && 'Conqueror',
    'Hero', // all units can go to hero class
  ].filter(v => v);
}

export function getHighestRarityUnit (category = 0, unitById = (id) => ({ name: id })) {
  for (let i = 9; i >= 0; --i) {
    const id = `${+category + i}`;
    const unit = unitById(id);
    if (unit) {
      return unit;
    }
  }
}

export function isValidUnit (unit) {
  const expectedFields = ['element', 'name', 'id'];
  return typeof unit === 'object' && expectedFields.every(f => unit[f] !== undefined);
}

export function getFillerUnit (isEmpty = false, element = 'fire') {
  return {
    id: 0,
    name: isEmpty ? squadFillerMapping.EMPTY : squadFillerMapping.ANY,
    rarity: 1,
    element,
    cost: 0,
    gender: 'other',
    guide_id: 0,
    kind: 'normal',
  };
}
