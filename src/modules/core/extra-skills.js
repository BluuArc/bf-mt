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
