import { isPassiveEffect, isProcEffect, getEffectId, getEffectType } from '@/modules/EffectProcessor/processor-helper';
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
