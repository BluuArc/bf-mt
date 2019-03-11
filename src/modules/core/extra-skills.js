import { getHighestRarityUnit } from './units';
import { getSphereCategory } from './items';

export function parseExtraSkillConditions (effect) {
  const parsedConditions = { unit: [], item: [], sphereType: [] };
  if (!effect.conditions || effect.conditions.length === 0) {
    return parsedConditions;
  }

  effect.conditions.forEach(condition => {
    if (condition['sphere category required'] !== undefined) {
      // parsedConditions.sphereType.push(`${condition['sphere category required']} sphere`);
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
}

export function conditionHelperGetUnitNames (units = [], unitById = (id) => ({ name: id, id })) {
  return units.map(entry => {
    const names = [];
    if (entry.name) {
      names.push(entry.name);
    } else {
      const id = (entry.id) ? entry.id.toString() : entry.toString();
      if (+id % 10 === 0) {
        const unit = getHighestRarityUnit(+id, unitById) || {};
        names.push(`any evolution of ${unit.name || id}`);
      } else {
        // specify a specific unit
        const unit = unitById(id) || {};
        names.push(unit.name || id);
      }
    }
    return names;
  }).reduce((acc, val) => acc.concat(val), []);
}

export function conditionHelperGetItemNames (items = [], itemById = (id) => ({ name: id, id })) {
  return items.map(id => {
    const item = itemById(id.toString()) || {};
    return item.name || id;
  });
}

export function convertParsedConditionsToMessage ({ unit = [], item = [], sphereType = [] }, { unitById, itemById }) {
  const conditions = [];

  if (unit.length > 0) {
    const names = conditionHelperGetUnitNames(unit, unitById);
    if (unit.length === 1 && names.length === 1) {
      conditions.push(`${names[0]} is in squad`);
    } else {
      conditions.push(`${names.join(' or ')} are in squad`);
    }
  }

  if (item.length > 0) {
    const names = conditionHelperGetItemNames(item, itemById);
    if (item.length === 1) {
      conditions.push(`${names[0]} is equipped`);
    } else {
      conditions.push(`${names.join(' or ')} are equipped`);
    }
  }

  if (sphereType.length > 0) {
    const names = sphereType.map(c => getSphereCategory(+c));
    if (sphereType.length === 1) {
      conditions.push(`${names[0]} sphere is equipped`);
    } else {
      conditions.push(`${names.join(' or ')} spheres are equipped`);
    }
  }

  return conditions.join(' or ');
}

export function splitEffectsByCondition (effects = [], { unitById, itemById }) {
  const conditionDictionary = {};
  conditionDictionary['No Condition'] = effects.filter(e => e.conditions.length === 0);

  // parse conditional effects
  effects.filter(e => e.conditions.length > 0)
    .forEach(effect => {
      const message = convertParsedConditionsToMessage(parseExtraSkillConditions(effect), { unitById, itemById });
      if (!conditionDictionary[message]) {
        conditionDictionary[message] = [];
      }
      conditionDictionary[message].push(effect);
    });

  return Object.entries(conditionDictionary)
    .map(([condition, parsedEffects]) => ({
      condition,
      // remove conditions field from effect entry
      // eslint-disable-next-line
      effects: parsedEffects.map(({ conditions, ...effect }) => effect),
    }))
    .filter(({ effects }) => effects.length > 0);
}

export function isValidSkill (skill) {
  const expectedFields = ['rarity', 'name', 'id', 'desc'];
  return typeof skill === 'object' && expectedFields.every(f => skill[f] !== undefined);
}

export function getEmptySkill () {
  return {
    id: 0,
    name: 'None',
    desc: 'No Extra Skill selected',
    rarity: 0,
  };
}
