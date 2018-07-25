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
    const value = !isNaN(effect) ? effect : ((effect && effect['buff turns']) || 0);
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
  getSphereCategory (num) {
    const categories = {
      0: 'None',
      1: 'Status Enhancing',
      2: 'Critical',
      3: 'Drop',
      4: 'Ailment Inducing',
      5: 'Element Fusion',
      6: 'BB Gauge',
      7: 'HP Recovery',
      8: 'Target Setting',
      9: 'Damage Deflecting',
      10: 'Damage Reducing',
      11: 'Spark',
      12: 'Defense Piercing',
      13: 'Attack Boosting',
      14: 'Special',
    };
    return categories[+num];
  },
  getHighestRarityUnit (category = 0, unitById = (id) => ({ name: id })) {
    for (let i = 9; i >= 0; --i) {
      const id = `${+category + i}`;
      const unit = unitById(id);
      if (unit) {
        return unit;
      }
    }
  },
  conditionHelperGetUnitNames (units = [], unitById = (id) => ({ name: id, id })) {
    return units.map(entry => {
      const names = [];
      if (entry.name) {
        // names.push(`${entry.name}${entry.id ? ` (${entry.id})` : ''}`);
        names.push(entry.name);
      } else {
        const id = (entry.id) ? entry.id.toString() : entry.toString();
        if (+id % 10 === 0) {
          const unit = this.getHighestRarityUnit(+id, unitById) || {};
          names.push(`any evolution of ${unit.name || id}`);
        } else {
          // specify a specifc unit
          const unit = unitById(id) || {};
          names.push(unit.name || id);
        }
      }
      return names;
    }).reduce((acc, val) => acc.concat(val), []);
  },
  conditionalHelperGetItemNames (items = [], itemById = (id) => ({ name: id, id })) {
    return items.map(id => {
      const item = itemById(id.toString()) || {};
      return item.name || id;
    });
  },
  getConditionMessage (effect) {
    return this.convertParsedConditionsToMessage(this.parseConditions(effect));
  },
  parseConditions (effect) {
    const parsedConditions = { unit: [], item: [], sphereType: [] };
    if (!effect.conditions || effect.conditions.length === 0) {
      return parsedConditions;
    }

    effect.conditions.forEach(condition => {
      if (condition['sphere category required'] !== undefined) {
        parsedConditions.sphereType.push(condition['sphere category required (raw)']);
      } else if (condition['item required'] !== undefined) {
        if (Array.isArray(condition['item required']) && condition['item required'].length > 0) {
          condition['item required'].forEach(item => {
            if (!parsedConditions.item.includes(item)) {
              parsedConditions.item.push(item);
            }
          });
        } else {
          parsedConditions.item.push(condition['item required']);
        }
      } else if (condition['unit required'] !== undefined) {
        if (Array.isArray(condition['unit required']) && condition['unit required'].length > 0) {
          condition['unit required'].forEach(unit => {
            if (!parsedConditions.unit.includes(unit)) {
              parsedConditions.unit.push(unit);
            }
          });
        } else {
          parsedConditions.unit.push(condition['unit required']);
        }
      } else if (condition.unknown !== undefined) {
        parsedConditions.item.push(`unknown sphere type ${condition['unknown']}`);
      }
    });

    return parsedConditions;
  },
  convertParsedConditionsToMessage ({ unit = [], item = [], sphereType = [] }, { unitById, itemById }) {
    const conditions = [];

    if (unit.length > 0) {
      const names = this.conditionHelperGetUnitNames(unit, unitById);
      if (unit.length === 1 && names.length === 1) {
        conditions.push(`${names[0]} is in squad`);
      } else {
        conditions.push(`${names.join(' or ')} are in squad`);
      }
    }

    if (item.length > 0) {
      const names = this.conditionalHelperGetItemNames(item, itemById);
      if (item.length === 1) {
        conditions.push(`${names[0]} is equipped`);
      } else {
        conditions.push(`${names.join(' or ')} are equipped`);
      }
    }

    if (sphereType.length > 0) {
      const names = sphereType.map(c => this.getSphereCategory(+c));
      if (sphereType.length === 1) {
        conditions.push(`${names[0]} sphere is equipped`);
      } else {
        conditions.push(`${names.join(' or ')} spheres are equipped`);
      }
    }

    return conditions.join(' or ');
  },
};

export default helper;
