import EffectTypes from './effect-types';
import helper from './processor-helper';
// import EffectProcessor from './effect-processor';
import IconKeyMappings from './icon-key-mappings';
// import knownConstants from '../../modules/constants';
const passiveTypes = require('@/assets/buff-translation/passives.json');

const getUnknownParams = (effect) => effect['unknown passive params'].split(',').map(v => +v);

const unknownPassives = {
  ...(() => {
    const entries = {};
    Object.keys(passiveTypes.unknown_passive).forEach(id => {
      entries[id] = helper.generateDefaultEntry(id);
    });
    return entries;
  })(),
  '72': {
    desc: 'Turn End Effects Occur at Start of Turn',
    config: {},
    possibleIcons: () => [
      IconKeyMappings.PASSIVE_BUFF_HPRECTURNSTART.name,
      IconKeyMappings.PASSIVE_BUFF_BBRECTURNSTART.name,
    ],
    type: [EffectTypes.PASSIVE.name],
    process (effect = {}, context) {
      const values = [];

      const params = getUnknownParams(effect);

      // eslint-disable-next-line no-unused-vars
      const [hpStart, bbStart, ...otherParams] = params;

      if (hpStart === 1) {
        const iconKey = IconKeyMappings.PASSIVE_BUFF_HPRECTURNSTART.name;
        values.push({ iconKey, value: { hpStart }, desc: 'Activate turn end HP related effects at turn start instead' });
      }

      if (bbStart === 1) {
        const iconKey = IconKeyMappings.PASSIVE_BUFF_BBRECTURNSTART.name;
        values.push({ iconKey, value: { bbStart }, desc: 'Activate turn end BB gauge related effects at turn start instead' });
      }

      return {
        type: this.type,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
};

export default unknownPassives;
