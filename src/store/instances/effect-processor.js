export const EffectTypes = {
  ATTACK: {
    name: 'Attack',
    desc: 'These types of effects directly inflict damage on targets.',
  },
  PASSIVE: {
    name: 'Passive',
    desc: 'These effects are always active unless nullified by an enemy skill or battle restriction. Passives from different sources usually stack.',
  },
  'INSTANT/BURST': {
    name: 'Instant/Burst',
    desc: 'These take effect as soon as they are cast and are usually stackable with other effects of the same type.',
  },
  TIMED: {
    name: 'Timed',
    desc: 'These conditionally occur (e.g. from the start of battle, after X damage is taken, etc.) and last for a set amount of turns. Timed buffs of the same effect do not stack, regardless of the source. Newer timed buffs of the same type will override the old buff.',
  },
  ACTIVE: {
    name: 'Active',
    desc: 'These are usually turn based; the source for these effects are from unit bursts (BB, SBB, UBB) or enemy skills. Newer active buffs of the same type will override the old buff (using the new value and duration).',
  },
  UNKNOWN: {
    name: 'Unknown',
    desc: 'These effects aren\'t supported by the effect processor yet.',
  },
};

export const IconKeyMappings = {
  UNKNOWN: { src: require('@/assets/secret.png'), name: 'UNKNOWN' },
};

// TODO: import separate modules for handling procs, passives, and buffs
export class EffectProcessor {
  // mainly used for reference
  static sampleProcessResult (effect = {}, context) {
    return {
      fullDescription: 'full description goes here',
      type: EffectTypes.UNKNOWN.name,
      originalEffect: effect,
      context,
      values: [
        {
          iconKey: 'icon key goes here',
          value: 'value used for comparison goes here; can be string, number, object, array, etc.',
          desc: 'description of buff goes here',
        },
      ],
    };
  }

  static defaultProcessResult (effect = {}, context) {
    return {
      fullDescription: 'Unknown effect',
      type: EffectTypes.UNKNOWN.name,
      originalEffect: effect,
      context,
      values: [
        { iconKey: IconKeyMappings.UNKNOWN.name, value: effect, desc: `Unknown values. Effect Keys: [${Object.keys(effect).join(', ')}]` },
      ],
    };
  }

  static process (effect = {}, context) {
    return this.defaultProcessResult(effect, context);
  }
}
