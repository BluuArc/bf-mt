import IconKeyMappings from './icon-key-mappings';
import EffectTypes from './effect-types';

const helper = {
  multiStatToObject (hp, atk, def, rec, crit) {
    return { hp, atk, def, rec, crit };
  },
  containsAnyKey (input = {}, keys = []) {
    return Object.keys(input).some(key => keys.includes(key));
  },
  getNumberAsPolarizedPercent (number = 0) {
    return `${(number < 0 ? number.toString() : `+${number}`)}%`;
  },
  getTargetData (inputArea, inputType, options = {}) {
    const validTypes = ['party', 'self', 'enemy'];
    let area, type;
    let isPassive = options.isPassive || false;
    if (typeof inputArea === 'object' && inputArea['target type'] && inputArea['target area']) {
      type = inputArea['target type'];
      area = inputArea['target area'];
    } else if (typeof inputType === 'object' && inputType['target type'] && inputType['target area']) {
      area = inputType['target area'];
      type = inputType['target type'];
    } else if (typeof inputArea === 'object' && inputArea['passive target']) {
      type = inputArea['passive target'];
      isPassive = true;
    } else if (typeof inputType === 'object' && inputType['passive target']) {
      type = inputType['passive target'];
      isPassive = true;
    } else {
      area = inputArea;
      type = inputType;
    }

    if (!validTypes.includes(type)) {
      type = (options.isLS) ? 'party' : 'self';
    }

    let result;
    if (type === 'self') {
      result = 'self';
    } else if ((area === 'aoe' || isPassive) && type === 'party') {
      result = 'party';
    } else if (area === 'aoe' && type === 'enemy') {
      result = 'all enemies';
    } else if (area === 'single' && type === 'enemy') {
      result = 'one enemy';
    } else if (area === 'single' && type === 'party') {
      result = 'one ally';
    } else {
      result = `${area},${type}`;
    }

    return !options.noParentheses ? `(${result})` : result;
  },
  getTurns (effect) {
    const value = !isNaN(effect) ? effect : effect['buff turns'];
    return { value, text: `${value} turn` };
  },
  getIconKey (key = '') {
    return (IconKeyMappings[key] || {}).name || key;
  },
  capitalize (str = '') {
    return str[0].toUpperCase().concat(str.slice(1).toLowerCase());
  },
};

const procs = {
  '5': {
    desc: 'Regular and Elemental ATK/DEF/REC/Crit Rate',
    config: {
      processOrder: ['atk', 'def', 'rec', 'crit'],
      regular: {
        atk: 'atk% buff (1)',
        def: 'def% buff (3)',
        rec: 'rec% buff (5)',
        crit: 'crit% buff (7)',
      },
      reduction: {
        atk: 'atk% buff (2)',
        def: 'def% buff (4)',
        rec: 'rec% buff (6)',
        crit: 'crit% buff (8)',
      },
      elemental: {
        atk: 'atk% buff (13)',
        def: 'def% buff (14)',
        rec: 'rec% buff (15)',
        crit: 'crit% buff (16)',
      },
    },
    process (effect = {}, context) {
      const values = [];
      const targetData = helper.getTargetData(effect);
      const turns = helper.getTurns(effect);
      const elementBuffed = (effect['element buffed'] || 'null').toUpperCase();
      const getBuffsFor = (statTypes) => {
        return helper.containsAnyKey(effect, this.config.processOrder.map(key => statTypes[key]))
          ? helper.multiStatToObject(undefined, ...(this.config.processOrder.map(key => effect[statTypes[key]])))
          : {};
      };

      const regularBuffs = getBuffsFor(this.config.regular);
      this.config.processOrder.forEach(stat => {
        if (regularBuffs[stat]) {
          const iconKey = helper.getIconKey(stat !== 'crit' ? `BUFF_${stat.toUpperCase()}UP` : 'BUFF_CRTRATEUP');
          const descLabel = stat !== 'crit' ? stat.toUpperCase() : 'Critical Hit Rate';
          values.push({ iconKey, value: { value: +regularBuffs[stat], element: elementBuffed }, desc: `${turns.text} ${helper.getNumberAsPolarizedPercent(+regularBuffs[stat])} ${descLabel} ${targetData}` });
        }
      });

      const reductionBuffs = getBuffsFor(this.config.reduction);
      this.config.processOrder.forEach(stat => {
        if (reductionBuffs[stat]) {
          const iconKey = helper.getIconKey(stat !== 'crit' ? `BUFF_${stat.toUpperCase()}DOWN` : 'BUFF_CRTRATEDOWN');
          const descLabel = stat !== 'crit' ? stat.toUpperCase() : 'Critical Hit Rate';
          values.push({ iconKey, value: { value: +reductionBuffs[stat], element: elementBuffed }, desc: `${turns.text} ${helper.getNumberAsPolarizedPercent(+reductionBuffs[stat])} ${descLabel} ${targetData}` });
        }
      });

      const elementalBuffs = getBuffsFor(this.config.elemental);
      this.config.processOrder.forEach(stat => {
        if (elementalBuffs[stat]) {
          const iconKey = helper.getIconKey(stat !== 'crit' ? `BUFF_${elementBuffed}${stat.toUpperCase()}UP` : `BUFF_${elementBuffed}CRTRATEDOWN`);
          const descLabel = stat !== 'crit' ? stat.toUpperCase() : 'Critical Hit Rate';
          values.push({ iconKey, value: { value: +elementalBuffs[stat], element: elementBuffed }, desc: `${turns.text} ${helper.getNumberAsPolarizedPercent(+elementalBuffs[stat])} ${helper.capitalize(elementBuffed)} ${descLabel} ${targetData}` });
        }
      });

      return {
        type: EffectTypes.ACTIVE.name,
        turnDuration: turns.value,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
};

export default procs;
