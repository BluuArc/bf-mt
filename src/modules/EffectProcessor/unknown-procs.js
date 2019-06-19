import { effectTypes } from '../constants';
import * as helper from './processor-helper';
// import knownConstants from '../../modules/constants';
import IconKeyMappings from './icon-key-mappings';
import { getEffectName } from '@/modules/core/buffs';
const procTypes = require('@/assets/buff-translation/procs.json');

const generateUnknownEntry = (id) => ({
  ...(helper.generateDefaultEntry(id)),
  desc: getEffectName({ 'unknown proc id': id }) || `Unknown buff ${id}`,
  type: [effectTypes.UNKNOWN.name],
});

const unknownProcs = {
  ...(() => {
    const entries = {};
    procTypes.unknown_proc.forEach(id => {
      const defaultEntry = helper.generateDefaultEntry(id);
      defaultEntry.desc = getEffectName({ 'unknown proc id': id }) || defaultEntry.desc;
      entries[id] = defaultEntry;
    });
    return entries;
  })(),
  '0': generateUnknownEntry('0'),
  '70002': {
    desc: 'Recast BB/SBB/UBB',
    config: {},
    possibleIcons: () => [IconKeyMappings.SG_BUFF_DBLBB_EU.name],
    type: [effectTypes.ACTIVE.name],
    process (effect = {}, context = {}) {
      const values = [];
      const targetData = helper.getTargetData(effect);

      const params = effect['unknown proc param'].split(',').map(v => +v);
      const baseChance = params[0] * 100;
      const turns = helper.getTurns(params[1]);
      const addedChance = params[2] * 100;
      const specialUnits = params.slice(3).filter(v => v !== 0);

      const iconKey = IconKeyMappings.SG_BUFF_DBLBB_EU.name;
      const getUnitName = context.getUnitName || (id => id);
      const specialDesc = (addedChance === 0 && specialUnits.length === 0)
        ? ''
        : (specialUnits.length === 1)
          ? `if ${getUnitName(specialUnits[0])}`
          : `per unit in {${specialUnits.map(getUnitName).join(', ') || '[MISSING UNIT LIST]'}`;
      const desc = [
        `${helper.getNumberAsPolarizedPercent(baseChance)} chance`,
        specialDesc.length > 0 ? `(${helper.getNumberAsPolarizedPercent(addedChance)} chance ${specialDesc} is found in squad` : '',
        'to recast BB/SBB/UBB',
        targetData,
      ].join(' ');
      values.push({ iconKey, value: { baseChance, addedChance, specialUnits, turns, targetData }, desc });
      return {
        type: this.type,
        turnDuration: turns.value,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
};

export default unknownProcs;
