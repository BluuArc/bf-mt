import { isPassiveEffect, isProcEffect, getEffectId } from '@/modules/EffectProcessor/processor-helper';
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
