import {
  unitPositionMapping,
  squadFillerMapping,
  squadUnitActions,
  burstTypes,
  squadBuffTypes,
  targetTypes,
} from '@/modules/constants';
import {
  spCodeToIndex,
  isValidUnit,
  spCodeToEffects,
  getSpEntryEffects,
} from '@/modules/core/units';
import { isValidSkill } from '@/modules/core/extra-skills';
import { isValidSphere, getItemEffects } from '@/modules/core/items';
import { getBurstEffects } from '@/modules/core/bursts';
import { getEffectId, getEffectType } from '@/modules/EffectProcessor/processor-helper';

export function squadToShorthand (squad = { units: [] }) {
  return squad.units
    .map((unit, i) => [
      (unit.id === squadFillerMapping.EMPTY && 'E') || (unit.id === squadFillerMapping.ANY && 'X') || unit.id,
      unitPositionMapping.indexOf(unit.position),
      unit.es || '-',
      unit.spheres.join('+') || '-',
      (i === squad.lead && 'L') || (i === squad.friend && 'F') || '-',
      unit.bbOrder,
      unit.action,
      unit.sp || '-',
    ].join('~'))
    .join(',');
}

export function makeSquadUnitEntry ({
  id = '',
  position = unitPositionMapping[0],
  es = '',
  spheres = [],
  bbOrder = 0,
  action = '',
  sp = '',
} = {}) {
  const toString = (val) => (val || '').toString();
  return {
    id: (id === 'E' && squadFillerMapping.EMPTY) || (id === 'X' && squadFillerMapping.ANY) || toString(id),
    position,
    es: toString(es),
    spheres: spheres.map(toString),
    bbOrder,
    action,
    sp,
  };
}

export function generateFillerSquadUnitEntry ({
  isEmpty = false,
  position = unitPositionMapping[0],
  bbOrder = 0,
} = {}) {
  return makeSquadUnitEntry({
    id: isEmpty ? squadFillerMapping.EMPTY : squadFillerMapping.ANY,
    position,
    bbOrder,
    action: isEmpty ? squadUnitActions.NONE : squadUnitActions.ATK,
  });
}

export function getEffectMappingFromSquadUnitEntry (
  unitEntry = generateFillerSquadUnitEntry(),
  {
    // NOTE: these are synchronous getters
    getUnit = () => {},
    getItem = () => {}, // eslint-disable-line no-unused-vars
    getExtraSkill = () => {}, // eslint-disable-line no-unused-vars
  } = {},
) {
  const unitEffects = {
    ls: [],
    es: [],
    [squadUnitActions.BB]: [],
    [squadUnitActions.SBB]: [],
    [squadUnitActions.UBB]: [],
    sp: [],
  };
  if (unitEntry.id && unitEntry.id !== squadFillerMapping.EMPTY && unitEntry.id !== squadFillerMapping.ANY) {
    const unit = getUnit(unitEntry.id) || {};
    if (unit['leader skill'] && Array.isArray(unit['leader skill'].effects)) {
      unitEffects.ls = Array.from(unit['leader skill'].effects).map(e => ({ ...e, sourcePath: 'unit.ls' }));
    }

    if (unit['extra skill'] && Array.isArray(unit['extra skill'].effects)) {
      unitEffects.es = Array.from(unit['extra skill'].effects).map(e => ({ ...e, sourcePath: 'unit.es' }));
    }

    burstTypes.forEach(bbType => {
      let burstData = (unit[bbType] && Array.isArray(unit[bbType].levels))
        ? getBurstEffects(unit[bbType])
        : {};
      if (Array.isArray(burstData.effects)) {
        unitEffects[bbType] = Array.from(burstData.effects).map(e => ({ ...e, sourcePath: `unit.${bbType}` }));
      }
    });

    if (unitEntry.sp && Array.isArray(unit.feskills)) {
      unitEffects.sp = Array.from(new Set(spCodeToEffects(unitEntry.sp, unit.feskills)))
        .reduce((acc, val) => acc.concat(getSpEntryEffects(val).map(e => ({ ...e, sourcePath: 'unit.sp' }))), []);
    }
  }

  let extraSkillEffects = [];
  if (unitEntry.es) {
    const extraSkill = getExtraSkill(unitEntry.es) || {};
    if (Array.isArray(extraSkill.effects)) {
      extraSkillEffects = Array.from(extraSkill.effects).map(e => ({ ...e, sourcePath: 'es' }));
    }
  }

  let sphereEffects = {};
  if (Array.isArray(unitEntry.spheres)) {
    unitEntry.spheres.forEach(sphereId => {
      const item = getItem(sphereId) || {};
      const effectData = getItemEffects(item);
      if (effectData.length > 0) {
        sphereEffects[sphereId] = effectData.map(e => ({ ...e, sourcePath: `sphere:${sphereId}` }));
      }
    });
  }

  return {
    unit: unitEffects,
    es: extraSkillEffects,
    spheres: sphereEffects,
  };
}

export function generateDefaultSquad (allEmpty = false, units) {
  return {
    lead: 0,
    friend: 3,
    name: `Squad ${new Date().toLocaleString()}`,
    units: Array.isArray(units)
      ? units
      : new Array(6)
        .fill(0)
        .map((_, i) => generateFillerSquadUnitEntry({
          isEmpty: allEmpty,
          position: unitPositionMapping[i],
          bbOrder: i + 1,
        })),
  };
}

export function cloneSquad (squad = {}) {
  const { lead, friend, name, simulatorOptions } = squad;
  return {
    lead,
    friend,
    name,
    units: sortUnitsByPosition(squad.units.map(makeSquadUnitEntry), false),
    simulatorOptions,
  };
}

export function shorthandToSquad (shorthand = '', name = `Squad ${new Date().toLocaleString()}`) {
  let leadIndex = 0, friendIndex = 0;
  const units = shorthand.split(',').map((entry, i) => {
    const [
      id,
      positionIndex,
      esText,
      sphereText,
      leadFriendFlag,
      bbOrder,
      action,
      spText,
    ] = entry.split('~');
    if (leadFriendFlag === 'L') {
      leadIndex = i;
    } else if (leadFriendFlag === 'F') {
      friendIndex = i;
    }

    return makeSquadUnitEntry({
      id,
      position: unitPositionMapping[positionIndex],
      es: esText !== '-' ? esText : '',
      spheres: sphereText !== '-' ? sphereText.split('+') : [],
      bbOrder: +bbOrder,
      action,
      sp: spText !== '-' ? spText : '',
    });
  });
  return {
    name,
    lead: leadIndex,
    friend: friendIndex,
    units,
  };
}

export function fixSquadErrors (squad = {}, {
  // NOTE: these are synchronous getters
  getUnit = () => {},
  getItem = () => {},
  getExtraSkill = () => {},
} = {}) {
  const units = [];
  const messages = [];
  let { lead, friend } = squad;
  const filledPositions = new Set();
  const usedOrders = new Set();
  if (Array.isArray(squad.units)) {
    // only allow 6 entries at most
    const currentUnits = squad.units.filter(u => typeof u === 'object').slice(0, 6);
    const defaultUnitActions = [squadUnitActions.SBB, squadUnitActions.BB];
    const isValidBbOrder = (num) => num >= 1 && num <= 6;

    currentUnits.forEach((unit, i) => {
      if (typeof unit === 'object') {
        const unitData = getUnit(unit.id) || {};
        // get value or defaults for each property of a squad unit entry
        const id = (unit.id === squadFillerMapping.ANY || unit.id === squadFillerMapping.EMPTY || isValidUnit(unitData))
          ? unit.id
          : squadFillerMapping.ANY; // default to entry for ANY

        const unitIdentifer = unitData.name
          ? `Unit [${unitData.name}] at index ${i}`
          : `Unit [${unit.id || id}] at index ${i}`;
        if (id !== unit.id) {
          messages.push(`${unitIdentifer} has an invalid ID [${unit.id}]. Used default filler unit entry [${squadFillerMapping.ANY}].`);
        }

        if (lead === i && id === squadFillerMapping.EMPTY) {
          messages.push(`There is an empty unit at index ${lead} and cannot be leader. Removed leader indicator.`);
          lead = -1;
        } else if (friend === i && id === squadFillerMapping.EMPTY) {
          messages.push(`There is an empty unit at index ${friend} cannot be friend leader. Removed friend leader indicator.`);
          friend = -1;
        }

        const position = unitPositionMapping.includes(unit.position) &&
          !filledPositions.has(unit.position) &&
          unit.position;
        if (position) {
          filledPositions.add(position);
        } else {
          messages.push(`${unitIdentifer} has invalid position [${unit.position}]. Used default position value instead.`);
        }

        const bbOrder = id !== squadFillerMapping.EMPTY &&
          isValidBbOrder(unit.bbOrder) &&
          !usedOrders.has(unit.bbOrder) &&
          unit.bbOrder;
        if (bbOrder) {
          usedOrders.add(bbOrder);
        } else {
          messages.push(`${unitIdentifer} has invalid BB Order [${unit.bbOrder}]. Used default BB Order value instead.`);
        }

        // default order of actions when current current action is invalid (if a unit has it): SBB, BB, ATK
        const action = id === squadFillerMapping.EMPTY
          ? squadUnitActions.NONE
          : (id === squadFillerMapping.ANY && unit.action) || (unitData[unit.action] && unit.action) || (defaultUnitActions.find(a => !!unitData[a]));
        if (action !== unit.action) {
          messages.push(`${unitIdentifer} has invalid action [${unit.action}]. Used default action [${action}].`);
        }

        const extraSkill = (id !== squadFillerMapping.EMPTY && unit.es && isValidSkill(getExtraSkill(unit.es)))
          ? unit.es
          : undefined;
        if (extraSkill !== unit.es && !!unit.es) {
          messages.push(`${unitIdentifer} has invalid Extra Skill [${unit.es}]. Removed Extra Skill.`);
        }

        const spheres = ((id !== squadFillerMapping.EMPTY && Array.isArray(unit.spheres)) ? unit.spheres : [])
          .filter(sphere => isValidSphere(getItem(sphere)));
        if (!Array.isArray(unit.spheres)) {
          messages.push(`${unitIdentifer} has invalid sphere entry. Used default of no spheres.`);
        } else if (spheres.length !== unit.spheres.length) {
          messages.push(`${unitIdentifer} has invalid spheres [${unit.spheres.filter(s => !spheres.includes(s)).join(', ')}]. Removed them from the entry.`);
        }

        const sp = (id !== squadFillerMapping.EMPTY && unitData.feskills && typeof unit.sp === 'string')
          ? unit.sp.split('').filter(code => unitData.feskills[spCodeToIndex(code)]).join('')
          : undefined;
        if (sp !== unit.sp && !!unit.sp) {
          const message = [
            `${unitIdentifer} has invalid SP code [${unit.sp}].`,
            sp ? `Set SP code to [${sp}].` : `Removed SP code.`,
          ].join(' ');
          messages.push(message);
        }

        units.push(makeSquadUnitEntry({
          id,
          position,
          bbOrder,
          action,
          es: extraSkill,
          spheres,
          sp,
        }));
      } else {
        messages.push(`Unit at input index ${i} is invalid and has been removed from squad.`);
      }
    });
  }

  // fill in units with invalid positions and bbOrders
  const possibleOrders = (new Array(6).fill(0).map((_, i) => i + 1));
  units.forEach(unit => {
    if (!unit.position) {
      unit.position = unitPositionMapping.find(p => !filledPositions.has(p));
      filledPositions.add(unit.position);
    }

    if (!unit.bbOrder) {
      unit.bbOrder = possibleOrders.find(order => !usedOrders.has(order));
      usedOrders.add(unit.bbOrder);
    }
  });

  if (units.length < 6) {
    messages.push(`${units.length} valid units found. Added ${6 - units.length} filler units.`);
  }
  for (let i = units.length; i < 6; ++i) {
    const position = unitPositionMapping.find(p => !filledPositions.has(p));
    filledPositions.add(position);

    const bbOrder = possibleOrders.find(order => !usedOrders.has(order));
    usedOrders.add(bbOrder);

    units.push(generateFillerSquadUnitEntry({
      position,
      bbOrder,
    }));
  }

  // remove lead/friend if those values are invalid
  if (!units[lead] || units[lead].id === squadFillerMapping.EMPTY) {
    messages.push(`Unit at index ${lead} cannot be leader because it is invalid or empty. Removed leader indicator.`);
    lead = -1;
  }
  if (!units[friend] || units[friend].id === squadFillerMapping.EMPTY) {
    messages.push(`Unit at index ${lead} cannot be friend leader because it is invalid or empty. Removed friend leader indicator.`);
    friend = -1;
  }

  // remove friend lead if lead and friend refer to the same unit
  if (lead !== -1 && friend !== -1 && lead === friend) {
    messages.push(`Unit at index ${lead} cannot be lead and friend lead. Removed friend leader indicator.`);
    friend = -1;
  }

  return {
    lead,
    friend,
    name: squad.name || 'Default Squad Name',
    units: sortUnitsByPosition(units),
    warnings: messages,
    simulatorOptions: squad.simulatorOptions,
  };
}

export function getMultidexDatabaseIdsFromSquads (squads = [generateDefaultSquad()]) {
  const unitIds = new Set(), esIds = new Set(), itemIds = new Set();
  const squadsToCheck = Array.isArray(squads) ? squads : [squads];
  squadsToCheck.forEach(squad => {
    squad.units.forEach(unit => {
      unitIds.add(unit.id);
      if (unit.es) {
        esIds.add(unit.es);
      }
      if (unit.spheres.length > 0) {
        unit.spheres.forEach(id => {
          itemIds.add(id);
        });
      }
    });
  });
  return {
    units: Array.from(unitIds),
    extraSkills: Array.from(esIds),
    items: Array.from(itemIds),
  };
}

export function sortUnitsByPosition (units = [], clone = true) {
  const toSort = clone ? units.slice() : units;
  return toSort.sort((a, b) => {
    const [positionA, positionB] = [unitPositionMapping.indexOf(a.position), unitPositionMapping.indexOf(b.position)];
    return positionA - positionB;
  });
}

export function getEffectsListForSquadUnitEntry (
  {
    unitEntry = generateFillerSquadUnitEntry(),
    target = targetTypes.PARTY,
    effectType = squadBuffTypes.PROC,
    squad = generateDefaultSquad(),
  }, syncGetters = {
    getUnit: () => {},
    getItem: () => {},
    getExtraSkill: () => {},
  },
) {
  const entryEffects = getEffectMappingFromSquadUnitEntry(unitEntry, syncGetters);
  const extractBuffsFromTriggeredEffect = (effect = {}, sourcePath) => Array.isArray(effect['triggered effect'])
    ? Array.from(effect['triggered effect']).map(e => ({ ...e, sourcePath }))
    : [];
  const extractBuffsFromEffects = (effects = []) => effects.map(e => extractBuffsFromTriggeredEffect(e, e.sourcePath))
    .filter(e => e.length > 0)
    .reduce((acc, arr) => acc.concat(arr), []);
  const removeOldSpOptions = (currentArr = [], spToRemove = []) => currentArr.filter(e => !spToRemove.includes(e));

  const ADD_TO_LS_PASSIVE_ID = '107';
  const UNKNOWN_PASSIVE_ID_KEY = 'unknown passive id';
  const PASSIVE_TARGET_KEY = 'passive target';
  const TARGET_TYPE_KEY = 'target type';
  const TRIGGER_ON_KEYS = {
    BB: 'trigger on bb',
    SBB: 'trigger on sbb',
    UBB: 'trigger on ubb',
  };
  const ADD_TO_KEYS = {
    BB: 'add to bb',
    SBB: 'add to sbb',
    UBB: 'add to ubb',
  };
  const KNOWN_TARGET_TYPES = [targetTypes.PARTY, targetTypes.SELF, targetTypes.ENEMY];
  const isLsActive = (squad.units.indexOf(unitEntry) === squad.lead || squad.units.indexOf(unitEntry) === squad.friend);

  const filteredEffects = {
    unitLs: [],
    unitEs: [],
    unitNonUbb: [],
    unitUbb: [],
    elgif: [],
    spheres: [],
    unitSp: [],
  };
  const processExtraSkillForProcs = (esEffects = [], matchesTargetType = () => false) => {
    esEffects.forEach(esEffect => {
      const buffs = extractBuffsFromTriggeredEffect(esEffect, esEffect.sourcePath)
        .filter(matchesTargetType)
        .map(e => ({
          ...e,
          esConditions: esEffect.conditions,
        }));
      if (esEffect[TRIGGER_ON_KEYS.UBB] && buffs.length > 0) {
        filteredEffects.unitUbb = filteredEffects.unitUbb.concat(buffs.map(b => ({
          ...b,
          [TRIGGER_ON_KEYS.UBB]: esEffect[TRIGGER_ON_KEYS.UBB],
          triggeredOn: 'ubb',
        })));
      }
      if ((esEffect[TRIGGER_ON_KEYS.BB] || esEffect[TRIGGER_ON_KEYS.SBB]) && buffs.length > 0) {
        [TRIGGER_ON_KEYS.BB, TRIGGER_ON_KEYS.SBB]
          .filter(t => esEffect[t])
          .forEach(t => {
            filteredEffects.unitNonUbb = filteredEffects.unitNonUbb.concat(buffs.map(b => ({
              ...b,
              [t]: esEffect[t],
              triggeredOn: t === TRIGGER_ON_KEYS.BB ? 'bb' : 'sbb',
            })));
          });
      }
    });
  };

  // TODO: burst effects
  if (effectType === squadBuffTypes.PROC) {
    // identical steps regardless of target
    const matchesTargetType = (e = {}) => {
      return target !== targetTypes.OTHER
        ? e[TARGET_TYPE_KEY] === target
        : !KNOWN_TARGET_TYPES.includes(e[TARGET_TYPE_KEY]);
    };
    burstTypes.forEach(burstType => {
      const burstEffects = entryEffects.unit[burstType].filter(matchesTargetType);
      if (burstType !== squadUnitActions.UBB) {
        filteredEffects.unitNonUbb = filteredEffects.unitNonUbb.concat(burstEffects);
      } else {
        filteredEffects.unitUbb = filteredEffects.unitUbb.concat(burstEffects);
      }
    });

    if (isLsActive) {
      filteredEffects.unitLs = extractBuffsFromEffects(entryEffects.unit.ls)
        .filter(matchesTargetType);
    }
    processExtraSkillForProcs(entryEffects.unit.es);

    // assumption: SP entries are in order so upgrades to previous enhancements are closer to the end of the array
    entryEffects.unit.sp.forEach(spEffect => {
      const spEffectType = getEffectType(spEffect);
      const spEffectId = getEffectId(spEffect);
      if (spEffect['triggered effect']) {
        const buffs = extractBuffsFromTriggeredEffect(spEffect, spEffect.sourcePath)
          .filter(matchesTargetType)
          .map(e => {
            const carriedKeys = burstTypes.map(t => `trigger on ${t}`).concat(['sp_type']);
            const carriedProperties = carriedKeys.reduce((acc, key) => {
              if (spEffect[key]) {
                acc[key] = spEffect[key];
              }
              return acc;
            }, {});
            return ({
              ...e,
              ...carriedProperties,
            });
          });

        if (spEffect[TRIGGER_ON_KEYS.UBB] && buffs.length > 0) {
          const existingSpBuffs = filteredEffects.unitUbb.filter(e => getEffectType(e) === spEffectType && getEffectId(e) === spEffectId && e.sp_type === spEffect.sp_type);
          if (existingSpBuffs.length > 0) { // remove old one, as current one will replace it
            filteredEffects.unitUbb = removeOldSpOptions(filteredEffects.unitUbb, existingSpBuffs);
          }
          filteredEffects.unitUbb = filteredEffects.unitUbb.concat(buffs.map(b => ({
            ...b,
            [TRIGGER_ON_KEYS.UBB]: spEffect[TRIGGER_ON_KEYS.UBB],
            triggeredOn: 'ubb',
          })));
        }
        if ((spEffect[TRIGGER_ON_KEYS.BB] || spEffect[TRIGGER_ON_KEYS.SBB]) && buffs.length > 0) {
          const existingSpBuffs = filteredEffects.unitNonUbb.filter(e => getEffectType(e) === spEffectType && getEffectId(e) === spEffectId && e.sp_type === spEffect.sp_type);
          if (existingSpBuffs.length > 0) { // remove old one, as current one will replace it
            filteredEffects.unitNonUbb = removeOldSpOptions(filteredEffects.unitNonUbb, existingSpBuffs);
          }
          [TRIGGER_ON_KEYS.BB, TRIGGER_ON_KEYS.SBB]
          .filter(t => spEffect[t])
            .forEach(t => {
              filteredEffects.unitNonUbb = filteredEffects.unitNonUbb.concat(buffs.map(b => ({
                ...b,
                [t]: spEffect[t],
                triggeredOn: t === TRIGGER_ON_KEYS.BB ? 'bb' : 'sbb',
              })));
            });
        }
      } else if (spEffect.sp_type === ADD_TO_KEYS.BB || spEffect.sp_type === ADD_TO_KEYS.SBB) {
        // only add burst enhancements if they are already included
        const existingBuff = filteredEffects.unitNonUbb.find(e => getEffectType(e) === spEffectType && getEffectId(e) === spEffectId);
        if (existingBuff) {
          const existingSpBuffs = filteredEffects.unitNonUbb.filter(e => getEffectType(e) === spEffectType && getEffectId(e) === spEffectId && e.sp_type === spEffect.sp_type);
          if (existingSpBuffs.length > 0) { // remove old one, as current one will replace it
            filteredEffects.unitNonUbb = removeOldSpOptions(filteredEffects.unitNonUbb, existingSpBuffs);
          }
          if (spEffect.sp_type === ADD_TO_KEYS.BB) {
            filteredEffects.unitNonUbb.push({
              ...spEffect,
              triggeredOn: 'bb',
            });
          }
          if (spEffect.sp_type === ADD_TO_KEYS.SBB) {
            filteredEffects.unitNonUbb.push({
              ...spEffect,
              triggeredOn: 'sbb',
            });
          }
        }
      } else if (spEffect.sp_type === ADD_TO_KEYS.UBB) {
        // only add burst enhancements if they are already included
        const existingBuff = filteredEffects.unitUbb.find(e => getEffectType(e) === spEffectType && getEffectId(e) === spEffectId);
        if (existingBuff) {
          const existingSpBuffs = filteredEffects.unitUbb.filter(e => getEffectType(e) === spEffectType && getEffectId(e) === spEffectId && e.sp_type === spEffect.sp_type);
          if (existingSpBuffs.length > 0) { // remove old one, as current one will replace it
            filteredEffects.unitUbb = removeOldSpOptions(filteredEffects.unitUbb, existingSpBuffs);
          }
          filteredEffects.unitUbb.push({
            ...spEffect,
            triggeredOn: 'ubb',
          });
        }
      }
    });

    Object.values(entryEffects.spheres).forEach(sphereEffects => {
      sphereEffects.forEach(sphereEffect => {
        const buffs = extractBuffsFromTriggeredEffect(sphereEffect, sphereEffect.sourcePath)
          .filter(matchesTargetType);
        if (sphereEffect[TRIGGER_ON_KEYS.UBB] && buffs.length > 0) {
          filteredEffects.unitUbb = filteredEffects.unitUbb.concat(buffs.map(b => ({
            ...b,
            [TRIGGER_ON_KEYS.UBB]: sphereEffect[TRIGGER_ON_KEYS.UBB],
            triggeredOn: 'ubb',
          })));
        }
        if ((sphereEffect[TRIGGER_ON_KEYS.BB] || sphereEffect[TRIGGER_ON_KEYS.SBB]) && buffs.length > 0) {
          [TRIGGER_ON_KEYS.BB, TRIGGER_ON_KEYS.SBB]
          .filter(t => sphereEffect[t])
            .forEach(t => {
              filteredEffects.unitNonUbb = filteredEffects.unitNonUbb.concat(buffs.map(b => ({
                ...b,
                [t]: sphereEffect[t],
                triggeredOn: t === TRIGGER_ON_KEYS.BB ? 'bb' : 'sbb',
              })));
            });
        }
      });
    });

    processExtraSkillForProcs(entryEffects.es);
  } else if (target === targetTypes.PARTY && effectType === squadBuffTypes.PASSIVE) {
    if (isLsActive) {
      filteredEffects.unitLs = entryEffects.unit.ls;
      filteredEffects.unitSp = entryEffects.unit.sp.filter(e => e.sp_type === 'add to passive' || e[UNKNOWN_PASSIVE_ID_KEY] === ADD_TO_LS_PASSIVE_ID); // add to LS
    }
    filteredEffects.unitEs = entryEffects.unit.es.filter(e => e[PASSIVE_TARGET_KEY] === target || e[UNKNOWN_PASSIVE_ID_KEY] === ADD_TO_LS_PASSIVE_ID);
    filteredEffects.elgif = entryEffects.es.filter(e => e[PASSIVE_TARGET_KEY] === target || e[UNKNOWN_PASSIVE_ID_KEY] === ADD_TO_LS_PASSIVE_ID);
    Object.values(entryEffects.spheres).forEach(sphere => {
      const buffs = sphere.filter(triggeredEffect => triggeredEffect[UNKNOWN_PASSIVE_ID_KEY] === ADD_TO_LS_PASSIVE_ID);
      if (buffs.length > 0) {
        filteredEffects.spheres = filteredEffects.spheres.concat(buffs);
      }
    });
  } else if (target === targetTypes.SELF && effectType === squadBuffTypes.PASSIVE) {
    filteredEffects.unitEs = entryEffects.unit.es.filter(e => e[PASSIVE_TARGET_KEY] === target && extractBuffsFromTriggeredEffect(e).length === 0);
    filteredEffects.elgif = entryEffects.es.filter(e => e[PASSIVE_TARGET_KEY] === target && extractBuffsFromTriggeredEffect(e).length === 0);
    Object.values(entryEffects.spheres).forEach(sphere => {
      const buffs = sphere.filter(e => extractBuffsFromTriggeredEffect(e).length === 0);
      if (buffs.length > 0) {
        filteredEffects.spheres = filteredEffects.spheres.concat(buffs);
      }
    });
    entryEffects.unit.sp.filter(e => extractBuffsFromTriggeredEffect(e).length === 0 && !e.sp_type.startsWith('add to'))
      .forEach(spEffect => {
        const existingSpBuffs = filteredEffects.unitSp.filter(e => getEffectType(e) === getEffectType(spEffect) && getEffectId(e) === getEffectId(spEffect) && e.sp_type === spEffect.sp_type);
        if (existingSpBuffs) { // remove old one, as current one will replace it
          filteredEffects.unitSp = removeOldSpOptions(filteredEffects.unitSp, existingSpBuffs);
        }
        filteredEffects.unitSp.push(spEffect);
      });
  } else if (target === targetTypes.OTHER && effectType === squadBuffTypes.PASSIVE) {
    const matchesTargetType = (e = {}) => !KNOWN_TARGET_TYPES.includes(e[PASSIVE_TARGET_KEY]);
    filteredEffects.unitEs = entryEffects.unit.es.filter(e => matchesTargetType(e) && extractBuffsFromTriggeredEffect(e).length === 0);
    filteredEffects.elgif = entryEffects.es.filter(e => matchesTargetType(e) && extractBuffsFromTriggeredEffect(e).length === 0);
  }

  // combine all effects into single array and sort by effect ID and whether it has an SP type
  return Object.values(filteredEffects)
    .filter(v => v.length > 0)
    .reduce((acc, val) => acc.concat(val), [])
    .sort((a, b) => {
      return +getEffectId(a) - +getEffectId(b) ||
        (!a.sp_type && b.sp_type ? -1 : 1); // sp types should go after original values
    });
}

export function getMultidexParamsForSquadUnit (unit = generateFillerSquadUnitEntry()) {
  const links = [];
  if (unit.id !== squadFillerMapping.ANY && unit.id !== squadFillerMapping.EMPTY) {
    links.push({
      moduleName: 'units',
      id: unit.id,
      sp: unit.sp,
    });
  }

  if (unit.es) {
    links.push({
      moduleName: 'extraSkills',
      id: unit.es,
    });
  }

  // add unique entries
  Array.from(new Set(unit.spheres)).forEach(id => {
    links.push({
      moduleName: 'items',
      id,
    });
  });

  return links;
}
