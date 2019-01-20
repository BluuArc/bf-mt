export function getExtraTriggeredEffects (effect = {}) {
  return effect['triggered effect'] || [];
}

export function defaultGetEffects (obj = {}) {
  const effects = Array.from(obj.effects || (obj.effect && obj.effect.effect) || obj.effect || []);
  return effects.concat(effects.map(getExtraTriggeredEffects).reduce((acc, val) => Array.isArray(val) ? acc.concat(val) : acc.concat([val]), []));
}

export function fitsBuffQuery (
  entry,
  procs,
  passives,
  getProcEffects = (entry) => defaultGetEffects(entry),
  getPassiveEffects = (entry) => defaultGetEffects(entry),
) {
  if (procs.length === 0 && passives.length === 0) {
    return true;
  }

  let hasProcAreas = procs.length === 0;
  if (!hasProcAreas) {
    const allProcs = getProcEffects(entry)
      .map(e => e['proc id'] || e['unknown proc id'])
      .filter(v => v)
      .map(v => +v);
    hasProcAreas = procs.every(id => allProcs.includes(+id));
  }

  let hasPassiveAreas = passives.length === 0;
  if (!hasPassiveAreas) {
    const allPassives = getPassiveEffects(entry)
      .map(e => e['passive id'] || e['unknown passive id'])
      .filter(v => v)
      .map(v => +v);
    hasPassiveAreas = passives.every(id => allPassives.includes(+id));
  }

   return hasProcAreas && hasPassiveAreas;
}


export function getBuffListFromSpSkill (skill = {}) {
  const buffs = [];
  if (skill.skill && skill.skill.effects) {
    skill.skill.effects.forEach(entry => {
      Object.keys(entry).forEach(type => {
        buffs.push(entry[type]);
      });
    });
  }
  return buffs.concat(buffs.map(getExtraTriggeredEffects).reduce((acc, val) => Array.isArray(val) ? acc.concat(val) : acc.concat([val]), []));
}

export function getBurstEffects (burst = {}) {
  const endLevelObject = burst && burst.levels && burst.levels[burst.levels.length - 1];
  return defaultGetEffects(endLevelObject || {});
}

const unitLocations = {
  ls: (unit = {}) => defaultGetEffects(unit['leader skill']),
  es: (unit = {}) => defaultGetEffects(unit['extra skill']),
  sp: (unit = {}) => {
    if (!unit.feskills) {
      return [];
    }
    const feskills = unit.feskills
      .map(getBuffListFromSpSkill)
      .reduce((acc, val) => acc.concat(val), []);
    return feskills;
  },
  bb: (unit = {}) => !unit.bb ? [] : getBurstEffects(unit.bb),
  sbb: (unit = {}) => !unit.sbb ? [] : getBurstEffects(unit.sbb),
  ubb: (unit = {}) => !unit.ubb ? [] : getBurstEffects(unit.ubb),
};

export function getEffectListInUnit (unit, location) {
  return (unitLocations[location] || defaultGetEffects)(unit);
}
