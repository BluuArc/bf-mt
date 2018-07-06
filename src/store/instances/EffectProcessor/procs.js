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
    },
    process (effect = {}, context) {
      const values = [];
      const targetData = helper.getTargetData(effect);
      if (helper.containsAnyKey(effect, this.config.processOrder.map(key => this.config.regular[key]))) {
        const buffs = helper.multiStatToObject(undefined, ...(this.config.processOrder.map(key => effect[this.config.regular[key]])));
        console.debug(buffs);
        this.config.processOrder.forEach(stat => {
          if (buffs[stat]) {
            const iconInfo = stat !== 'crit' ? IconKeyMappings[`BUFF_${stat.toUpperCase()}UP`] : IconKeyMappings.BUFF_CRTRATEUP;
            const descLabel = stat !== 'crit' ? stat.toUpperCase() : 'Critical Hit Rate';
            values.push({ iconKey: iconInfo.name, value: +buffs[stat], desc: `${helper.getNumberAsPolarizedPercent(+buffs[stat])} ${descLabel} ${targetData}` });
          }
        });
      }
      console.debug('proc 5', values);
      return {
        type: EffectTypes.ACTIVE.name,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
};

export default procs;
