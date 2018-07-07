
import IconKeyMappings from './icon-key-mappings';

const helper = {
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
};

export default helper;
