import IconKeyMappings from './icon-key-mappings';
import EffectTypes from './effect-types';
import numbro from 'numbro';

const iconGeneratorSymbol = Symbol('iconGeneratorSymbol');
const helper = {
  iconGeneratorSymbol,
  formatNumber (number, options = { thousandSeparated: true }, useMinThreshold = true) {
    return (useMinThreshold && number < 1000) ? number : numbro(number).format(options);
  },
  multiStatToObject (hp, atk, def, rec, crit) {
    return {
      hp,
      atk,
      def,
      rec,
      crit,
    };
  },
  containsAnyKey (input = {}, keys = []) {
    return Object.keys(input).some(key => keys.includes(key));
  },
  getNumberAsPolarizedNumber (number = 0) {
    return `${(number < 0 ? number.toString() : `+${number}`)}`;
  },
  getNumberAsPolarizedPercent (number = 0) {
    return `${this.getNumberAsPolarizedNumber(number)}%`;
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
    return {
      value,
      text: `${value} turn`,
    };
  },
  getIconKey (key = '') {
    return (IconKeyMappings[key] || {}).name || key;
  },
  capitalize (str = '') {
    return str[0].toUpperCase().concat(str.slice(1).toLowerCase());
  },
  generateDefaultEntry (id = '0') {
    return {
      desc: `Untranslated buff ${id}`,
      type: [EffectTypes.UNKNOWN.name],
      possibleIcons: () => [IconKeyMappings.UNKNOWN.name],
      process (effect = {}, context) {
        return {
          type: this.type,
          originalEffect: effect,
          context,
          values: [
            { iconKey: IconKeyMappings.UNKNOWN.name, value: effect, desc: `Unknown effect. Effect Keys: [${Object.keys(effect).join(', ')}]` },
          ],
        };
      },
    };
  },
  getInnateAttackBoosts (effect) {
    const innateBoosts = [];

    const bc = effect['bb bc%'];
    const crit = effect['bb crit%'];
    const hc = effect['bb hc%'];
    if (bc) {
      innateBoosts.push(`innate ${this.getNumberAsPolarizedPercent(bc)} BC drop rate`);
    }
    if (crit) {
      innateBoosts.push(`innate ${this.getNumberAsPolarizedPercent(crit)} Critical Hit rate`);
    }
    if (hc) {
      innateBoosts.push(`innate ${this.getNumberAsPolarizedPercent(hc)} HC drop rate`);
    }

    return innateBoosts;
  },
  getFormattedMinMax (min = 0, max = 0) {
    const [formattedMin, formattedMax] = [this.formatNumber(min), this.formatNumber(max)];
    return (min !== max) ? [formattedMin, max > 0 ? '-' : ' to ', formattedMax].join('') : (formattedMin || formattedMax);
  },
};

export default helper;
