import { effectTypes, elements, unitTypes, ailments } from '../constants';
import helper from './processor-helper';
import EffectProcessor from './effect-processor';
import IconKeyMappings from './icon-key-mappings';
const passiveTypes = require('@/assets/buff-translation/passives.json');

const getConditionalData = (effect, context) => {
  const value = helper.parseConditions(effect);
  const text = helper.convertParsedConditionsToMessage(value, context);
  return { value, text };
};

const getTargetData = (effect, isLS) => (!isLS && !(effect.sp_type === 'add to passive')) ? (`(${effect['passive target'] || 'self'})`) : '';

const passives = {
  ...(() => {
    const entries = {};
    Object.keys(passiveTypes.passive).forEach(id => {
      entries[id] = helper.generateDefaultEntry(id);
    });
    return entries;
  })(),
  '1': {
    desc: 'Regular HP/ATK/DEF/REC/Crit Rate Boost',
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
    type: [effectTypes.PASSIVE.name],
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
  '2': {
    desc: 'Elemental HP/ATK/DEF/REC/Crit Rate Boost',
    config: {
      processOrder: ['hp', 'atk', 'def', 'rec', 'crit'],
      regular: {
        hp: 'hp% buff',
        atk: 'atk% buff',
        def: 'def% buff',
        rec: 'rec% buff',
        crit: 'crit% buff',
        [helper.iconGeneratorSymbol]: (stat, elementBuffed = 'FIRE') => helper.getIconKey(stat !== 'crit' ? `PASSIVE_BUFF_${elementBuffed}${stat.toUpperCase()}UP` : `PASSIVE_BUFF_${elementBuffed}CRTRATEUP`),
      },
    },
    possibleIcons () {
      const iconKeys = [];
      elements.forEach(element => {
        this.config.processOrder.forEach(stat => {
          iconKeys.push(this.config.regular[helper.iconGeneratorSymbol](stat, element.toUpperCase()));
        });
      });
      return iconKeys;
    },
    type: [effectTypes.PASSIVE.name],
    process (effect = {}, context = {}) {
      const values = [];
      const conditions = getConditionalData(effect, context);
      const targetData = getTargetData(effect, context.isLS);

      const elementsBuffed = effect['elements buffed'] && effect['elements buffed'].length > 0 ? effect['elements buffed'] : ['unknown'];
      const statBuffs = helper.multiStatToObject(...(this.config.processOrder.map(stat => effect[this.config.regular[stat]])));
      elementsBuffed.forEach(element => {
        this.config.processOrder.forEach(stat => {
          if (statBuffs[stat]) {
            const iconKey = this.config.regular[helper.iconGeneratorSymbol](stat, element.toUpperCase());
            const descLabel = stat !== 'crit' ? stat.toUpperCase() : 'Critical Hit Rate';
            values.push({ iconKey, value: { value: +statBuffs[stat], targetData, conditions }, desc: [helper.getNumberAsPolarizedPercent(+statBuffs[stat]), helper.capitalize(element), descLabel, targetData || ''].join(' ') });
          }
        });
      });

      return {
        type: this.type,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
  '3': {
    desc: 'Type Based HP/ATK/DEF/REC Boost',
    config: {
      processOrder: ['hp', 'atk', 'def', 'rec', 'crit'],
      typeOrder: unitTypes.slice(),
      regular: {
        hp: 'hp% buff',
        atk: 'atk% buff',
        def: 'def% buff',
        rec: 'rec% buff',
        [helper.iconGeneratorSymbol]: (stat, typeBuffed = 'LORD') => helper.getIconKey(`PASSIVE_BUFF_${typeBuffed}${stat.toUpperCase()}UP`),
      },
    },
    possibleIcons () {
      const iconKeys = [];
      this.config.typeOrder.forEach(type => {
        this.config.processOrder.forEach(stat => {
          iconKeys.push(this.config.regular[helper.iconGeneratorSymbol](stat, type.toUpperCase()));
        });
      });
      return iconKeys;
    },
    type: [effectTypes.PASSIVE.name],
    process (effect = {}, context = {}) {
      const values = [];
      const conditions = getConditionalData(effect, context);
      const targetData = getTargetData(effect, context.isLS);

      const typeBuffed = effect['unit type buffed'] || 'unknown';
      const statBuffs = helper.multiStatToObject(...(this.config.processOrder.map(stat => effect[this.config.regular[stat]])));
      this.config.processOrder.forEach(stat => {
        if (statBuffs[stat]) {
          const iconKey = this.config.regular[helper.iconGeneratorSymbol](stat, typeBuffed.toUpperCase());
          const descLabel = stat.toUpperCase();
          values.push({ iconKey, value: { value: +statBuffs[stat], targetData, conditions }, desc: [helper.getNumberAsPolarizedPercent(+statBuffs[stat]), helper.capitalize(typeBuffed), descLabel, targetData || ''].join(' ') });
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
  '4': {
    desc: 'Status Negation/Resistance',
    config: {
      processOrder: ailments.slice(),
      [helper.iconGeneratorSymbol]: ailment => `PASSIVE_BUFF_${ailment.toUpperCase()}BLK`,
      keyMapping: (() => {
        const mapping = {};
        ailments.forEach(ailment => {
          mapping[ailment] = (ailment === 'weak') ? 'weaken resist%' : `${ailment} resist%`;
        });
        return mapping;
      })(),
    },
    possibleIcons () {
      return this.config.processOrder.map(ailment => this.config[helper.iconGeneratorSymbol](ailment));
    },
    type: [effectTypes.PASSIVE.name],
    process (effect = {}, context = {}) {
      const values = [];
      const conditions = getConditionalData(effect, context);
      const targetData = getTargetData(effect, context.isLS);

      this.config.processOrder.forEach(ailment => {
        const value = effect[this.config.keyMapping[ailment]];
        if (value) {
          const iconKey = this.config[helper.iconGeneratorSymbol](ailment);
          const desc = [+value === 100 ? 'Negate' : `${helper.getNumberAsPolarizedPercent(+value)} resistance to`, helper.capitalize(ailment), targetData].join(' ');
          values.push({ iconKey, value: { value, conditions, targetData }, desc });
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
  '5': {
    desc: 'Elemental Mitigation',
    config: {},
    possibleIcons: () => elements.map(e => `PASSIVE_BUFF_${e.toUpperCase()}DMGDOWN`),
    type: [effectTypes.PASSIVE.name],
    process (effect = {}, context = {}) {
      const values = [];
      const conditions = getConditionalData(effect, context);
      const targetData = getTargetData(effect, context.isLS);

      elements.forEach(e => {
        if (effect[`${e} resist%`]) {
          const value = +effect[`${e} resist%`];
          const iconKey = `PASSIVE_BUFF_${e.toUpperCase()}DMGDOWN`;
          values.push({ iconKey, value: { value, targetData, conditions }, desc: [helper.getNumberAsPolarizedPercent(value), helper.capitalize(e), 'mitigation', targetData].join(' ') });
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
  '8': {
    desc: 'Damage Reduction/Mitigation',
    config: {
      iconKey: 'PASSIVE_BUFF_DAMAGECUT',
    },
    possibleIcons () {
      return [this.config.iconKey];
    },
    type: [effectTypes.PASSIVE.name],
    process (effect = {}, context = {}) {
      const values = [];
      const conditions = getConditionalData(effect, context);
      const targetData = getTargetData(effect, context.isLS);

      const iconKey = this.config.iconKey;
      const value = +effect['dmg% mitigation'];
      values.push({ iconKey, value: { value, targetData, conditions }, desc: [helper.getNumberAsPolarizedPercent(value), 'mitigation', targetData].join(' ') });

      return {
        type: this.type,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
  '9': {
    desc: 'BC Fill per Turn',
    config: {
      iconKey: 'PASSIVE_BUFF_BBREC',
    },
    possibleIcons () {
      return [this.config.iconKey];
    },
    type: [effectTypes.PASSIVE.name],
    process (effect = {}, context = {}) {
      const values = [];
      const conditions = getConditionalData(effect, context);
      const targetData = getTargetData(effect, context.isLS);

      const iconKey = this.config.iconKey;
      const value = +effect['bc fill per turn'];
      values.push({ iconKey, value: { value, targetData, conditions }, desc: `${helper.getNumberAsPolarizedNumber(value)} BC/turn ${targetData}` });

      return {
        type: this.type,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
  '10': {
    desc: 'HC Efficacy',
    config: {
      iconKey: 'PASSIVE_BUFF_HCREC',
    },
    possibleIcons () {
      return [this.config.iconKey];
    },
    type: [effectTypes.PASSIVE.name],
    process (effect = {}, context = {}) {
      const values = [];
      const conditions = getConditionalData(effect, context);
      const targetData = getTargetData(effect, context.isLS);

      const iconKey = this.config.iconKey;
      const value = +effect['hc effectiveness%'];
      values.push({ iconKey, value: { value, targetData, conditions }, desc: `${helper.getNumberAsPolarizedPercent(value)} HC efficacy ${targetData}` });

      return {
        type: this.type,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
  '11': {
    desc: 'HP Conditional ATK/DEF/REC/Crit Rate Boost',
    config: {
      processOrder: ['atk', 'def', 'rec', 'crit'],
      regular: {
        atk: 'atk% buff',
        def: 'def% buff',
        rec: 'rec% buff',
        crit: 'crit% buff',
        [helper.iconGeneratorSymbol]: stat => helper.getIconKey(stat !== 'crit' ? `PASSIVE_BUFF_HPTHRESH${stat.toUpperCase()}UP` : 'PASSIVE_BUFF_HPTHRESHCRTRATEUP'),
      },
    },
    possibleIcons () {
      return this.config.processOrder.map(stat => this.config.regular[helper.iconGeneratorSymbol](stat));
    },
    type: [effectTypes.PASSIVE.name],
    process (effect = {}, context = {}) {
      const values = [];
      const conditions = getConditionalData(effect, context);
      const targetData = getTargetData(effect, context.isLS);

      const hpAbove = effect['hp above % buff requirement'];
      const hpBelow = effect['hp below % buff requirement'];
      const hpModifiers = [];
      if (hpAbove) {
        if (hpAbove === 100) {
          hpModifiers.push(`when HP is full`);
        } else {
          hpModifiers.push(`when HP > ${hpAbove}%`);
        }
      }

      if (hpBelow) {
        hpModifiers.push(`when HP < ${hpBelow}%`);
      }

      const statBuffs = helper.multiStatToObject(undefined, ...(this.config.processOrder.map(stat => effect[this.config.regular[stat]])));
      this.config.processOrder.forEach(stat => {
        if (statBuffs[stat]) {
          const iconKey = this.config.regular[helper.iconGeneratorSymbol](stat);
          const descLabel = stat !== 'crit' ? stat.toUpperCase() : 'Critical Hit Rate';
          values.push({ iconKey, value: { value: +statBuffs[stat], targetData, conditions }, desc: [helper.getNumberAsPolarizedPercent(+statBuffs[stat]), descLabel, hpModifiers.join(' & '), targetData || ''].join(' ') });
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
  '12': {
    desc: 'HP Conditional HC/BC/Item/Zel/Karma Drop Rate Boost',
    config: {
      processOrder: ['hc', 'bc', 'item', 'zel', 'karma'],
      [helper.iconGeneratorSymbol]: (dropType) => `PASSIVE_BUFF_HPTHRESH${dropType.toUpperCase()}DROP`,
      keyMapping: {
        hc: 'hc drop rate% buff',
        bc: 'bc drop rate% buff',
        item: 'item drop rate% buff',
        zel: 'zel drop rate% buff',
        karma: 'karma drop rate% buff',
      },
      nameMapping: {
        hc: 'HC',
        bc: 'BC',
        item: 'Item',
        zel: 'Zel',
        karma: 'Karma',
      },
    },
    possibleIcons () {
      return this.config.processOrder.map(this.config[helper.iconGeneratorSymbol]);
    },
    type: [effectTypes.PASSIVE.name],
    process (effect = {}, context = {}) {
      const values = [];
      const conditions = getConditionalData(effect, context);
      const targetData = getTargetData(effect, context.isLS);

      const hpAbove = effect['hp above % buff requirement'];
      const hpBelow = effect['hp below % buff requirement'];
      const hpModifiers = [];
      if (hpAbove) {
        if (hpAbove === 100) {
          hpModifiers.push(`when HP is full`);
        } else {
          hpModifiers.push(`when HP > ${hpAbove}%`);
        }
      }

      if (hpBelow) {
        hpModifiers.push(`when HP < ${hpBelow}%`);
      }

      this.config.processOrder.forEach(type => {
        const value = effect[this.config.keyMapping[type]];
        if (value) {
          const iconKey = this.config[helper.iconGeneratorSymbol](type);
          const desc = [helper.getNumberAsPolarizedPercent(+value), this.config.nameMapping[type], 'drop rate', hpModifiers.join(' & '), targetData || ''].join(' ');
          values.push({ iconKey, value: { value, targetData, conditions }, desc });
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
  '13': {
    desc: 'BC Fill on Enemy Defeat',
    config: {
      iconKey: 'PASSIVE_BUFF_BBREC',
    },
    possibleIcons () {
      return [this.config.iconKey];
    },
    type: [effectTypes.PASSIVE.name],
    process (effect = {}, context = {}) {
      const values = [];
      const conditions = getConditionalData(effect, context);
      const targetData = getTargetData(effect, context.isLS);

      const iconKey = this.config.iconKey;
      const fillLow = +(effect['bc fill on enemy defeat low'] || 0);
      const fillHigh = +(effect['bc fill on enemy defeat high'] || 0);
      const chance = +(effect['bc fill on enemy defeat%'] || 0);
      const desc = [chance === 100 ? 'Fill' : `${chance}% chance to fill`, helper.getFormattedMinMax(fillLow, fillHigh), 'BC on enemy defeat', targetData].join(' ');
      values.push({ iconKey, value: { fillLow, fillHigh, chance, targetData, conditions }, desc });

      return {
        type: this.type,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
  '14': {
    desc: 'Chance Damage Reduction/Mitigation',
    config: {
      iconKey: 'PASSIVE_BUFF_DAMAGECUT',
    },
    possibleIcons () {
      return [this.config.iconKey];
    },
    type: [effectTypes.PASSIVE.name],
    process (effect = {}, context = {}) {
      const values = [];
      const conditions = getConditionalData(effect, context);
      const targetData = getTargetData(effect, context.isLS);

      const iconKey = this.config.iconKey;
      const value = +(effect['dmg reduction%'] || 0);
      const chance = +(effect['dmg reduction chance%'] || 0);
      const desc = [chance === 100 ? '' : `${chance}% chance of`, helper.getNumberAsPolarizedPercent(value), 'mitigation', targetData].join(' ');
      values.push({ iconKey, value: { value, chance, targetData, conditions }, desc });

      return {
        type: this.type,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
  '15': {
    desc: 'HP Recovery on Enemy Defeat',
    config: {
      iconKey: 'PASSIVE_BUFF_HPREC',
    },
    possibleIcons () {
      return [this.config.iconKey];
    },
    type: [effectTypes.PASSIVE.name],
    process (effect = {}, context = {}) {
      const values = [];
      const conditions = getConditionalData(effect, context);
      const targetData = getTargetData(effect, context.isLS);

      const iconKey = this.config.iconKey;
      const fillLow = +(effect['hp% recover on enemy defeat low'] || 0);
      const fillHigh = +(effect['hp% recover on enemy defeat high'] || 0);
      const desc = `Recover ${helper.getFormattedMinMax(fillLow, fillHigh)}% HP on enemy defeat ${targetData}`;
      values.push({ iconKey, value: { fillLow, fillHigh, targetData, conditions }, desc });

      return {
        type: this.type,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
  '16': {
    desc: 'HP Recovery on Battle Victory',
    config: {
      iconKey: 'PASSIVE_BUFF_HPREC',
    },
    possibleIcons () {
      return [this.config.iconKey];
    },
    type: [effectTypes.PASSIVE.name],
    process (effect = {}, context = {}) {
      const values = [];
      const conditions = getConditionalData(effect, context);
      const targetData = getTargetData(effect, context.isLS);

      const iconKey = this.config.iconKey;
      const fillLow = +(effect['hp% recover on battle win low'] || 0);
      const fillHigh = +(effect['hp% recover on battle win high'] || 0);
      const desc = `Recover ${helper.getFormattedMinMax(fillLow, fillHigh)}% HP on battle win ${targetData}`;
      values.push({ iconKey, value: { fillLow, fillHigh, targetData, conditions }, desc });

      return {
        type: this.type,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
  '17': {
    desc: 'HP Drain',
    config: {
      iconKey: 'PASSIVE_BUFF_HPABS',
    },
    possibleIcons () {
      return [this.config.iconKey];
    },
    type: [effectTypes.PASSIVE.name],
    process (effect = {}, context = {}) {
      const values = [];
      const conditions = getConditionalData(effect, context);
      const targetData = getTargetData(effect, context.isLS);

      const iconKey = this.config.iconKey;
      const drainLow = +(effect['hp drain% low'] || 0);
      const drainHigh = +(effect['hp drain% high'] || 0);
      const chance = +(effect['hp drain chance%'] || 0);
      const desc = [chance === 100 ? 'Recover' : `${chance}% chance to recover`, `${helper.getFormattedMinMax(drainLow, drainHigh)}% of damage dealt`, targetData].join(' ');
      values.push({ iconKey, value: { drainLow, drainHigh, chance, targetData, conditions }, desc });

      return {
        type: this.type,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
  '19': {
    desc: 'HC/BC/Item/Zel/Karma Drop Rate Boost',
    config: {
      processOrder: ['hc', 'bc', 'item', 'zel', 'karma'],
      [helper.iconGeneratorSymbol]: (dropType) => `PASSIVE_BUFF_${dropType.toUpperCase()}DROP`,
      keyMapping: {
        hc: 'hc drop rate% buff',
        bc: 'bc drop rate% buff',
        item: 'item drop rate% buff',
        zel: 'zel drop rate% buff',
        karma: 'karma drop rate% buff',
      },
      nameMapping: {
        hc: 'HC',
        bc: 'BC',
        item: 'Item',
        zel: 'Zel',
        karma: 'Karma',
      },
    },
    possibleIcons () {
      return this.config.processOrder.map(this.config[helper.iconGeneratorSymbol]);
    },
    type: [effectTypes.PASSIVE.name],
    process (effect = {}, context = {}) {
      const values = [];
      const conditions = getConditionalData(effect, context);
      const targetData = getTargetData(effect, context.isLS);

      this.config.processOrder.forEach(type => {
        const value = effect[this.config.keyMapping[type]];
        if (value) {
          const iconKey = this.config[helper.iconGeneratorSymbol](type);
          const desc = [helper.getNumberAsPolarizedPercent(+value), this.config.nameMapping[type], 'drop rate', targetData || ''].join(' ');
          values.push({ iconKey, value: { value, targetData, conditions }, desc });
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
  '20': {
    desc: 'Inflict Status Ailment',
    config: {
      processOrder: ailments.slice(),
      [helper.iconGeneratorSymbol]: ailment => `PASSIVE_DEBUFF_${ailment.toUpperCase()}`,
    },
    possibleIcons () {
      return this.config.processOrder.map(this.config[helper.iconGeneratorSymbol]);
    },
    type: [effectTypes.PASSIVE.name],
    process (effect = {}, context) {
      const values = [];
      const conditions = getConditionalData(effect, context);
      const targetData = getTargetData(effect, context.isLS);

      this.config.processOrder.forEach(ailment => {
        const value = effect[`${ailment}%`];
        if (value) {
          const iconKey = this.config[helper.iconGeneratorSymbol](ailment);
          values.push({ iconKey, value: { value, targetData, conditions }, desc: `${value}% chance to inflict ${helper.capitalize(ailment)} ${targetData}` });
        }
      });

      if (values.length === 0) {
        values.push({
          iconKey: IconKeyMappings.UNKNOWN.name,
          value: { value: 0, targetData, conditions },
          desc: `0% chance to inflict null ${targetData}` });
      }

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
    possibleIcons: () => [],
    type: [effectTypes.PASSIVE.name],
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
