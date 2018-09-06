import IconKeyMappings from './icon-key-mappings';
import { effectTypes } from '../constants';

import Procs from './procs';
import UnknownProcs from './unknown-procs';
import Passives from './passives';
import UnknownPassives from './unknown-passives';

import { Logger } from '@/modules/Logger';

const logger = new Logger({ prefix: '[Effect-Processor/Main]' });

export default class EffectProcessor {
  // mainly used for reference
  static sampleProcessResult (effect = {}, context) {
    return {
      type: effectTypes.UNKNOWN.name,
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
      type: [effectTypes.UNTRANSLATED.name],
      originalEffect: effect,
      context,
      values: [
        { iconKey: IconKeyMappings.UNKNOWN.name, value: effect, desc: `Untranslated effect. Effect Keys: [${Object.keys(effect).join(', ')}]` },
      ],
    };
  }

  static process (effect = {}, context) {
    try {
      if (effect['proc id'] && Procs[effect['proc id']]) {
        return Procs[effect['proc id']].process(effect, context);
      } else if (effect['unknown proc id'] && UnknownProcs[effect['unknown proc id']]) {
        return UnknownProcs[effect['unknown proc id']].process(effect, context);
      } else if (effect['passive id'] && Passives[effect['passive id']]) {
        return Passives[effect['passive id']].process(effect, context);
      } else if (effect['unknown passive id'] && UnknownPassives[effect['unknown passive id']]) {
        return UnknownPassives[effect['unknown passive id']].process(effect, context);
      }
    } catch (err) {
      logger.error('Error parsing effect', { effect, context }, err);
      return this.defaultProcessResult(effect, context);
    }
  }
}
