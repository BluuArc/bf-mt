import EffectTypes from './effect-types';
// import helper from './processor-helper';
import EffectProcessor from './effect-processor';

const passives = {
  '66': {
    desc: 'Add effect to BB/SBB/UBB',
    config: {
      burstTypes: ['bb', 'sbb', 'ubb'],
    },
    type: [EffectTypes.PASSIVE.name],
    process (effect = {}, context) {
      const addToLabel = this.config.burstTypes
        .filter(type => !!effect[`trigger on ${type}`])
        .map(type => type.toUpperCase())
        .join('/');

      const triggeredEffects = effect['triggered effect'].map(e => EffectProcessor.process(e));
      const skillTypes = [];
      triggeredEffects.forEach(effect => {
        effect.type.forEach(type => {
          if (!skillTypes.includes(type)) {
            skillTypes.push(type);
          }
        });
      });

      const values = triggeredEffects.map(triggeredEffect => {
        const { values, ...triggeredEffectContext } = triggeredEffect;
        return values.map(v => ({
          ...v,
          triggeredEffectContext,
          desc: `Add to ${addToLabel}: ${v.value.turns ? `${v.value.turns.text} ` : ''}${v.desc}`,
        }));
      }).reduce((acc, val) => acc.concat(val), []);
      return {
        type: this.type.concat(skillTypes),
        addToLabel,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
};

export default passives;
