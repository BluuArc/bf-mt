import IconKeyMappings from './icon-key-mappings';
import EffectTypes from './effect-types';

import ProcProcessor from './procs';
import PassiveProcessor from './passives';

// TODO: import separate modules for handling procs, passives, and buffs
class EffectProcessor {
  // mainly used for reference
  static sampleProcessResult (effect = {}, context) {
    return {
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
      type: [EffectTypes.UNKNOWN.name],
      originalEffect: effect,
      context,
      values: [
        { iconKey: IconKeyMappings.UNKNOWN.name, value: effect, desc: `Unknown effect. Effect Keys: [${Object.keys(effect).join(', ')}]` },
      ],
    };
  }

  static process (effect = {}, context) {
    try {
      if (effect['proc id'] && ProcProcessor[effect['proc id']]) {
        return ProcProcessor[effect['proc id']].process(effect, context);
      } else if (effect['passive id'] && PassiveProcessor[effect['passive id']]) {
        return PassiveProcessor[effect['passive id']].process(effect, context);
      }
    } catch (err) {
      console.error('Error parsing effect', { effect, context }, err);
    }
    return this.defaultProcessResult(effect, context);
  }
}

export default EffectProcessor;
