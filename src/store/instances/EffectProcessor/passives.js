import EffectTypes from './effect-types';
import helper from './processor-helper';
import EffectProcessor from './effect-processor';
// import { knownConstants } from '../../modules/db.common';
const passiveTypes = require('@/assets/buff-translation/passives.json');

const getConditionalData = (effect, context) => {
  const value = helper.parseConditions(effect);
  const text = helper.convertParsedConditionsToMessage(value, context);
  return { value, text };
};

const getTargetData = (effect, isLS) => (!isLS && !(effect.sp_type === 'add to passive')) ? (`(${effect['passive target'] || 'self'})`) : undefined;

const passives = {
  ...(() => {
    const entries = {};
    Object.keys(passiveTypes.passive).forEach(id => {
      entries[id] = helper.generateDefaultEntry(id);
    });
    return entries;
  })(),
  '1': {
    desc: 'Regular HP/ATK/DEF/REC/Crit Rate boost',
    config: {
      processOrder: ['hp', 'atk', 'def', 'rec', 'crit'],
      regular: {
        hp: 'hp% buff',
        atk: 'atk% buff',
        def: 'def% buff',
        rec: 'rec% buff',
        crit: 'crit% buff',
        [helper.iconGeneratorSymbol]: stat => helper.getIconKey(stat !== 'crit' ? `PASSIVE_BUFF_${stat.toUpperCase()}UP` : 'PASSIVE_BUFF_CRTRATEUP'),
      },
    },
    possibleIcons () {
      return this.config.processOrder.map(stat => this.config.regular[helper.iconGeneratorSymbol](stat));
    },
    type: [EffectTypes.PASSIVE.name],
    process (effect = {}, context = {}) {
      const values = [];
      const conditions = getConditionalData(effect, context);
      const targetData = getTargetData(effect, context.isLS);

      const statBuffs = helper.multiStatToObject(...(this.config.processOrder.map(stat => effect[this.config.regular[stat]])));
      this.config.processOrder.forEach(stat => {
        if (statBuffs[stat]) {
          const iconKey = this.config.regular[helper.iconGeneratorSymbol](stat);
          const descLabel = stat !== 'crit' ? stat.toUpperCase() : 'Critical Hit Rate';
          values.push({ iconKey, value: { value: +statBuffs[stat], targetData, conditions }, desc: [helper.getNumberAsPolarizedPercent(+statBuffs[stat]), descLabel, targetData || ''].join(' ') });
        }
      });

      return {
        type: this.type,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
  '66': {
    desc: 'Add effect to BB/SBB/UBB',
    config: {
      burstTypes: ['bb', 'sbb', 'ubb'],
    },
    // filterKeyMapping: {
    //   'Add to BB': {
    //     type: Boolean,
    //     key: 'trigger on bb',
    //   },
    //   'Add to SBB': {
    //     type: Boolean,
    //     key: 'trigger on SBB',
    //   },
    //   'Add to UBB': {
    //     type: Boolean,
    //     key: 'trigger on UBB',
    //   },
    // },
    type: [EffectTypes.PASSIVE.name],
    possibleIcons: () => [],
    process (effect = {}, context) {
      const conditions = getConditionalData(effect, context);
      const addToLabel = this.config.burstTypes
        .filter(type => !!effect[`trigger on ${type}`])
        .map(type => type.toUpperCase())
        .join('/');

      const triggeredEffects = effect['triggered effect'].map(e => EffectProcessor.process(e));

      // get list of all possible attack types from triggered effects
      const skillTypes = [];
      triggeredEffects.forEach(effect => {
        effect.type.forEach(type => {
          if (!skillTypes.includes(type)) {
            skillTypes.push(type);
          }
        });
      });

      // every value is output like a proc, but contains triggered effect context
      const values = triggeredEffects.map(triggeredEffect => {
        const { values, ...triggeredEffectContext } = triggeredEffect;
        return values.map(v => ({
          ...v,
          triggeredEffectContext,
          value: {
            ...(v.value),
            conditions,
          },
          desc: `Add to ${addToLabel}: ${v.value.turns ? `${v.value.turns.text} ` : ''}${v.desc}`,
        }));
      }).reduce((acc, val) => acc.concat(val), []);
      return {
        type: this.type.concat(skillTypes),
        addToLabel,
        conditions,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
};

export default passives;
