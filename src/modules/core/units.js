import { attackingProcs } from '@/modules/EffectProcessor/constants';
import { spCategoryMapping } from '@/modules/constants';

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

export function getSpSkillEffects (skillEntry) {
  const effects = [];
  skillEntry.skill.effects.forEach(e => {
    // distinguish between passive and add to bb/sbb/ubb
    Object.keys(e).forEach(type => {
      const effect = e[type];
      effects.push({ sp_type: type, ...effect });
    });
  });
  return effects;
}

export function spCodeToIndex (char) {
  return char.charCodeAt(0) - ((char < 'a') ? 'A'.charCodeAt(0) : ('a'.charCodeAt(0))) + (char < 'a' ? 0 : 26);
}

export function spIndexToCode (index) {
  return String.fromCharCode(index >= 26 ? (index - 26 + 'a'.charCodeAt(0)) : (index + 'A'.charCodeAt(0)));
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
    });
    tempUnit = await Promise.resolve(getUnit(tempUnit.next.toString()));
  }
  return evolutions;
}
