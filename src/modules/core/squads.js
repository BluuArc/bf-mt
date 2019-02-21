import {
  unitPositionMapping,
  squadFillerMapping,
  squadUnitActions,
} from '@/modules/constants';
import { spCodeToIndex } from '@/modules/core/units';

export function squadToShorthand (squad = { units: [] }) {
  return squad.units
    .map((unit, i) => [
      unit.id,
      unitPositionMapping.indexOf(unit.position),
      unit.es || '-',
      unit.spheres.join('+') || '-',
      (i === squad.lead && 'L') || (i === squad.friend && 'F') || '-',
      unit.bbOrder,
      unit.bbType,
      unit.sp || '-',
    ].join('~'))
    .join(',');
}

export function makeSquadUnitEntry ({
  id = '',
  position = unitPositionMapping[0],
  es = '',
  spheres = [],
  bbOrder = 0,
  bbType = '',
  sp = '',
} = {}) {
  return {
    id,
    position,
    es,
    spheres,
    bbOrder,
    bbType,
    sp,
  };
}

export function generateFillerSquadUnitEntry ({
  isEmpty = false,
  position = unitPositionMapping[0],
  bbOrder = 0,
} = {}) {
  return makeSquadUnitEntry({
    id: isEmpty ? squadFillerMapping.EMPTY : squadFillerMapping.ANY,
    position,
    bbOrder,
  });
}

export function shorthandToSquad (shorthand = '', name = 'Default Name') {
  let leadIndex = 0, friendIndex = 0;
  const units = shorthand.split(',').map((entry, i) => {
    const [
      id,
      positionIndex,
      esText,
      sphereText,
      leadFriendFlag,
      bbOrder,
      bbType,
      spText,
    ] = entry.split('~');
    if (leadFriendFlag === 'L') {
      leadIndex = i;
    } else if (leadFriendFlag === 'F') {
      friendIndex = i;
    }

    return makeSquadUnitEntry({
      id,
      position: unitPositionMapping[positionIndex],
      es: esText !== '-' ? esText : '',
      spheres: sphereText !== '-' ? sphereText.split('+') : [],
      bbOrder: +bbOrder,
      bbType,
      sp: spText !== '-' ? spText : '',
    });
  });
  return {
    name,
    lead: leadIndex,
    friend: friendIndex,
    units,
  };
}

export function getSquadErrors (squad = {}, {
  // NOTE: these are synchronous getters
  getUnit = () => {},
  getItem = () => {},
  getExtraSkill = () => {},
} = {}) {
  const makeErrorEntry = (path = '', message = '', fix) => ({ path, message, fix });
  const generatePathKey = (...args) => args.join('.');
  const errors = [];

  // check if 6 unit entries are present
  // stop after these checks if any errors are found as further checks require units to be valid
  if (!Array.isArray(squad.units)) {
    errors.push(makeErrorEntry(
      'units',
      'No units array specified',
    ));
    return errors;
  } else if (squad.units.length !== 6) {
    errors.push(makeErrorEntry(
      'units',
      'A squad must have exactly 6 units',
    ));
    return errors;
  }

  if (isNaN(squad.lead)) {
    errors.push(makeErrorEntry(
      'lead',
      'No squad lead specified',
    ));
  } else if (+squad.lead < 0 || +squad.lead > 5) { // bounds check
    errors.push(makeErrorEntry(
      'lead',
      'Squad lead is not a unit',
    ));
  } else if (!isNaN(squad.friend) && +squad.lead === +squad.friend) {
    errors.push(makeErrorEntry(
      'lead',
      'Lead and friend are the same',
    ));
  }

  // friend lead is not required, but will be validated if present
  if (!isNaN(squad.friend)) {
    if (+squad.friend < 0 || +squad.friend > 5) { // bounds check
      errors.push(makeErrorEntry(
        'friend',
        'Squad friend lead is not a unit',
      ));
    }
  }

  // validate each unit entry
  const filledPositions = new Set();
  const usedOrders = new Set();
  const possibleActions = Object.values(squadUnitActions);
  // eslint-disable-next-line no-console
  console.warn(possibleActions);
  squad.units.forEach((unit, i) => {
    const pathEntry = `units.${i}`;
    if (isNaN(unit.id) && ![squadFillerMapping.EMPTY, squadFillerMapping.ANY].includes(unit.id)) {
      errors.push(makeErrorEntry(
        pathEntry,
        `Unit ID [${unit.id}] is not valid`,
      ));
    } else {
      const unitData = getUnit(unit.id) || {};
      // check position
      if (!unitPositionMapping.includes(unit.position)) {
        errors.push(makeErrorEntry(
          generatePathKey(pathEntry, 'position'),
          `Position [${unit.position}] is not valid`,
        ));
      } else if (filledPositions.has(unit.position)) {
        errors.push(makeErrorEntry(
          generatePathKey(pathEntry, 'position'),
          `Position [${unit.position}] is duplicated`,
        ));
      } else {
        filledPositions.add(unit.position);
      }

      // check order
      if (isNaN(unit.bbOrder)) {
        errors.push(makeErrorEntry(
          generatePathKey(pathEntry, 'bbOrder'),
          `Order [${unit.bbOrder}] is not valid`,
        ));
      } else if (usedOrders.has(+unit.bbOrder)) {
        errors.push(makeErrorEntry(
          generatePathKey(pathEntry, 'bbOrder'),
          `Order [${unit.bbOrder}] is duplicated`,
        ));
      } else {
        usedOrders.add(+unit.bbOrder);
      }

      // check against lead/friend indices
      if (!isNaN(squad.lead) && +squad.lead === i && !unitData) {
        errors.push(makeErrorEntry(
          pathEntry,
          `Leader [${unit.id}] is not a unit`,
        ));
      } else if (!isNaN(squad.friend) && +squad.friend === i && !unitData) {
        errors.push(makeErrorEntry(
          pathEntry,
          `Friend lead [${unit.id}] is not a unit`,
        ));
      }

      // check BB Type
      if (!possibleActions.includes(unit.bbType) || (unit.bbType !== squadUnitActions.NATK && !unitData[unit.bbType])) {
        errors.push(makeErrorEntry(
          generatePathKey(pathEntry, 'bbType'),
          `BB Type [${unit.bbType}] is not valid`,
        ));
      }

      // check ES
      if (unit.es) {
        const extraSkillData = getExtraSkill(unit.es) || {};
        if (Object.keys(extraSkillData) === 0) {
          errors.push(makeErrorEntry(
            generatePathKey(pathEntry, 'es'),
            `Extra skill [${unit.es}] is not valid`,
          ));
        }
      }

      // check spheres
      if (!Array.isArray(unit.spheres)) {
        errors.push(makeErrorEntry(
          generatePathKey(pathEntry, 'spheres'),
          `Spheres must be an array`,
        ));
      } else if (unit.spheres.length > 2) {
        errors.push(makeErrorEntry(
          generatePathKey(pathEntry, 'spheres'),
          `Cannot have more than 2 spheres`,
        ));
      } else {
        unit.spheres.forEach((sphereId, j) => {
          const sphereData = getItem(sphereId) || {};
          if (Object.keys(sphereData) === 0) {
            errors.push(makeErrorEntry(
              generatePathKey(pathEntry, 'spheres', j),
              `Sphere [${sphereId}] is not valid`,
            ));
          }
        });
      }

      // check enhancements
      if (unit.sp) {
        const feSkills = unitData.feSkills;
        if (!feSkills) {
          errors.push(makeErrorEntry(
            generatePathKey(pathEntry, 'sp'),
            `Unit [${unit.id}] can't have any enhancements`,
          ));
        } else {
          const mappedSkills = unit.sp.split('')
            .map(char => feSkills[spCodeToIndex(char)])
            .filter(v => v.skill);
          if (mappedSkills.length !== unit.sp.length) {
            errors.push(makeErrorEntry(
              generatePathKey(pathEntry, 'sp'),
              `Some SP options (${unit.sp}) are invalid for unit [${unit.id}]`,
            ));
          }
        }
      }
    }
  });

  return errors;
}
