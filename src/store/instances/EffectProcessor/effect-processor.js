import IconKeyMappings from './icon-key-mappings';
import EffectTypes from './effect-types';

import ProcProcessor from './procs';

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
        { iconKey: IconKeyMappings.UNKNOWN.name, value: effect, desc: `Unknown effect. Effect Keys: [${Object.keys(effect).join(', ')}]` },
      ],
    };
  }

  static process (effect = {}, context) {
    if (effect['proc id'] && ProcProcessor[effect['proc id']]) {
      return ProcProcessor[effect['proc id']].process(effect, context);
    }
    return this.defaultProcessResult(effect, context);
  }
}
