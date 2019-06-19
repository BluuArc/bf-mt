import { isPassiveEffect, isProcEffect, getEffectId, getEffectType } from '@/modules/EffectProcessor/processor-helper';
import { targetTypes, squadBuffTypes, burstTypes } from '@/modules/constants';
const metadata = require('@/assets/buff-translation/passive-proc-metadata.json');

export function getEffectName (effect = {}) {
  const id = getEffectId(effect) || NaN;
  let name;
  if (isPassiveEffect(effect) && metadata.passive[id]) {
    name = metadata.passive[id].Name;
  } else if (isProcEffect(effect) && metadata.proc[id]) {
    name = metadata.proc[id].Name;
  }

  return name;
}

export function handleUnknownParams (effect = {}) {
  const effectType = getEffectType(effect);
  let resultEffect = effect;
  if (effectType === 'passive' || effectType === 'proc') {
    const propertyName = effectType === 'passive'
      ? 'unknown passive params'
      : 'unknown proc param';
    const unknownParams = effect[propertyName] || '';
    if (unknownParams) {
      const splitParamsObject = unknownParams.split(',').reduce((acc, val, index) => {
        acc[`${propertyName}[${index}]`] = val;
        return acc;
      }, {});
      resultEffect = {
        ...effect,
        ...splitParamsObject,
      };
    }
  }
  return resultEffect;
}

export function getEffectsList ({
  // each is an array of effect entries with sourcePath already populated
  leaderSkillEffects = [],
  extraSkillEffects = [],
  nonUbbBurstEffects = [],
  ubbBurstEffects = [],
  elgifEffects = [],
  sphereEffects = [],
  spEnhancementEffects = [],

  target = targetTypes.PARTY,
  effectType = squadBuffTypes.PROC,
}) {
  const extractBuffsFromTriggeredEffect = (effect = {}, sourcePath, sourceSpCode) => Array.isArray(effect['triggered effect'])
    ? Array.from(effect['triggered effect']).map(e => sourceSpCode
        ? ({ ...e, sourcePath, sourceSpCode })
        : ({ ...e, sourcePath }))
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
    if (nonUbbBurstEffects.length > 0) {
      filteredEffects.unitNonUbb = filteredEffects.unitNonUbb.concat(nonUbbBurstEffects.filter(matchesTargetType));
    }
    if (ubbBurstEffects.length > 0) {
      filteredEffects.unitUbb = filteredEffects.unitUbb.concat(ubbBurstEffects.filter(matchesTargetType));
    }

    if (leaderSkillEffects.length > 0) {
      filteredEffects.unitLs = extractBuffsFromEffects(leaderSkillEffects)
        .filter(matchesTargetType);
    }

    if (extraSkillEffects.length > 0) {
      processExtraSkillForProcs(extraSkillEffects, matchesTargetType);
    }

    // assumption: SP entries are in order so upgrades to previous enhancements are closer to the end of the array
    spEnhancementEffects.forEach(spEffect => {
      const spEffectType = getEffectType(spEffect);
      const spEffectId = getEffectId(spEffect);
      if (spEffect['triggered effect']) {
        const buffs = extractBuffsFromTriggeredEffect(spEffect, spEffect.sourcePath, spEffect.sourceSpCode)
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

    processExtraSkillForProcs(elgifEffects, matchesTargetType);
  } else if (target === targetTypes.PARTY && effectType === squadBuffTypes.PASSIVE) {
    filteredEffects.unitLs = leaderSkillEffects.slice();
    filteredEffects.unitSp = spEnhancementEffects.filter(e => e.sp_type === 'add to passive' || e[UNKNOWN_PASSIVE_ID_KEY] === ADD_TO_LS_PASSIVE_ID); // add to LS

    filteredEffects.unitEs = extraSkillEffects.filter(e => e[PASSIVE_TARGET_KEY] === target || e[UNKNOWN_PASSIVE_ID_KEY] === ADD_TO_LS_PASSIVE_ID);
    filteredEffects.elgif = elgifEffects.filter(e => e[PASSIVE_TARGET_KEY] === target || e[UNKNOWN_PASSIVE_ID_KEY] === ADD_TO_LS_PASSIVE_ID);

    filteredEffects.spheres = sphereEffects.filter(triggeredEffect => triggeredEffect[UNKNOWN_PASSIVE_ID_KEY] === ADD_TO_LS_PASSIVE_ID);
  } else if (target === targetTypes.SELF && effectType === squadBuffTypes.PASSIVE) {
    filteredEffects.unitEs = extraSkillEffects.filter(e => e[PASSIVE_TARGET_KEY] === target && extractBuffsFromTriggeredEffect(e).length === 0);
    filteredEffects.elgif = elgifEffects.filter(e => e[PASSIVE_TARGET_KEY] === target && extractBuffsFromTriggeredEffect(e).length === 0);
    filteredEffects.spheres = sphereEffects.filter(e => extractBuffsFromTriggeredEffect(e).length === 0);

    spEnhancementEffects.filter(e => extractBuffsFromTriggeredEffect(e).length === 0 && !e.sp_type.startsWith('add to'))
      .forEach(spEffect => {
        const existingSpBuffs = filteredEffects.unitSp.filter(e => getEffectType(e) === getEffectType(spEffect) && getEffectId(e) === getEffectId(spEffect) && e.sp_type === spEffect.sp_type);
        if (existingSpBuffs) { // remove old one, as current one will replace it
          filteredEffects.unitSp = removeOldSpOptions(filteredEffects.unitSp, existingSpBuffs);
        }
        filteredEffects.unitSp.push(spEffect);
      });
  } else if (target === targetTypes.OTHER && effectType === squadBuffTypes.PASSIVE) {
    const matchesTargetType = (e = {}) => !KNOWN_TARGET_TYPES.includes(e[PASSIVE_TARGET_KEY]);
    filteredEffects.unitEs = extraSkillEffects.filter(e => matchesTargetType(e) && extractBuffsFromTriggeredEffect(e).length === 0);
    filteredEffects.elgif = elgifEffects.filter(e => matchesTargetType(e) && extractBuffsFromTriggeredEffect(e).length === 0);
  }

  // combine all effects into single array and sort by effect ID and whether it has an SP type
  return Object.values(filteredEffects)
    .filter(v => v.length > 0)
    .reduce((acc, val) => acc.concat(val), [])
    .map(handleUnknownParams)
    .sort((a, b) => {
      return +getEffectId(a) - +getEffectId(b) ||
        (!a.sp_type && b.sp_type ? -1 : 1); // sp types should go after original values
    });
}
