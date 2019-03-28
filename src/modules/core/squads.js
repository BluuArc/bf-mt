import {
  unitPositionMapping,
  squadFillerMapping,
  squadUnitActions,
} from '@/modules/constants';
import { spCodeToIndex, isValidUnit } from '@/modules/core/units';
import { isValidSkill } from '@/modules/core/extra-skills';
import { isValidSphere } from '@/modules/core/items';

export function squadToShorthand (squad = { units: [] }) {
  return squad.units
    .map((unit, i) => [
      (unit.id === squadFillerMapping.EMPTY && 'E') || (unit.id === squadFillerMapping.ANY && 'X') || unit.id,
      unitPositionMapping.indexOf(unit.position),
      unit.es || '-',
      unit.spheres.join('+') || '-',
      (i === squad.lead && 'L') || (i === squad.friend && 'F') || '-',
      unit.bbOrder,
      unit.action,
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
  action = '',
  sp = '',
} = {}) {
  const toString = (val) => (val || '').toString();
  return {
    id: (id === 'E' && squadFillerMapping.EMPTY) || (id === 'X' && squadFillerMapping.ANY) || toString(id),
    position,
    es: toString(es),
    spheres: spheres.map(toString),
    bbOrder,
    action,
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
    action: isEmpty ? squadUnitActions.NONE : squadUnitActions.ATK,
  });
}

export function generateDefaultSquad (allEmpty = false, units) {
  return {
    lead: 0,
    friend: 3,
    name: `Squad ${new Date().toLocaleString()}`,
    units: Array.isArray(units)
      ? units
      : new Array(6)
        .fill(0)
        .map((_, i) => generateFillerSquadUnitEntry({
          isEmpty: allEmpty,
          position: unitPositionMapping[i],
          bbOrder: i + 1,
        })),
  };
}

export function cloneSquad (squad = {}) {
  const { lead, friend, name } = squad;
  return {
    lead,
    friend,
    name,
    units: squad.units.map(makeSquadUnitEntry),
  };
}

export function shorthandToSquad (shorthand = '', name = `Squad ${new Date().toLocaleString()}`) {
  let leadIndex = 0, friendIndex = 0;
  const units = shorthand.split(',').map((entry, i) => {
    const [
      id,
      positionIndex,
      esText,
      sphereText,
      leadFriendFlag,
      bbOrder,
      action,
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
      action,
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

export function fixSquadErrors (squad = {}, {
  // NOTE: these are synchronous getters
  getUnit = () => {},
  getItem = () => {},
  getExtraSkill = () => {},
} = {}) {
  const units = [];
  const messages = [];
  let { lead, friend } = squad;
  const filledPositions = new Set();
  const usedOrders = new Set();
  if (Array.isArray(squad.units)) {
    // only allow 6 entries at most
    const currentUnits = squad.units.filter(u => typeof u === 'object').slice(0, 6);
    const defaultUnitActions = [squadUnitActions.SBB, squadUnitActions.BB];
    const isValidBbOrder = (num) => num >= 1 && num <= 6;

    currentUnits.forEach((unit, i) => {
      if (typeof unit === 'object') {
        const unitData = getUnit(unit.id) || {};
        // get value or defaults for each property of a squad unit entry
        const id = (unit.id === squadFillerMapping.ANY || unit.id === squadFillerMapping.EMPTY || isValidUnit(unitData))
          ? unit.id
          : squadFillerMapping.ANY; // default to entry for ANY

        const unitIdentifer = unitData.name
          ? `Unit [${unitData.name}] at index ${i}`
          : `Unit [${unit.id || id}] at index ${i}`;
        if (id !== unit.id) {
          messages.push(`${unitIdentifer} has an invalid ID [${unit.id}]. Used default filler unit entry [${squadFillerMapping.ANY}].`);
        }

        if (lead === i && id === squadFillerMapping.EMPTY) {
          messages.push(`There is an empty unit at index ${lead} and cannot be leader. Removed leader indicator.`);
          lead = -1;
        } else if (friend === i && id === squadFillerMapping.EMPTY) {
          messages.push(`There is an empty unit at index ${friend} cannot be friend leader. Removed friend leader indicator.`);
          friend = -1;
        }

        const position = unitPositionMapping.includes(unit.position) &&
          !filledPositions.has(unit.position) &&
          unit.position;
        if (position) {
          filledPositions.add(position);
        } else {
          messages.push(`${unitIdentifer} has invalid position [${unit.position}]. Used default position value instead.`);
        }

        const bbOrder = id !== squadFillerMapping.EMPTY &&
          isValidBbOrder(unit.bbOrder) &&
          !usedOrders.has(unit.bbOrder) &&
          unit.bbOrder;
        if (bbOrder) {
          usedOrders.add(bbOrder);
        } else {
          messages.push(`${unitIdentifer} has invalid BB Order [${unit.bbOrder}]. Used default BB Order value instead.`);
        }

        // default order of actions when current current action is invalid (if a unit has it): SBB, BB, ATK
        const action = id === squadFillerMapping.EMPTY
          ? squadUnitActions.NONE
          : (unitData[unit.action] && unit.action) || (defaultUnitActions.find(a => !!unitData[a])) || squadUnitActions.ATK;
        if (action !== unit.action) {
          messages.push(`${unitIdentifer} has invalid action [${unit.action}]. Used default action [${action}].`);
        }

        const extraSkill = (id !== squadFillerMapping.EMPTY && unit.es && isValidSkill(getExtraSkill(unit.es)))
          ? unit.es
          : undefined;
        if (extraSkill !== unit.es && !!unit.es) {
          messages.push(`${unitIdentifer} has invalid Extra Skill [${unit.es}]. Removed Extra Skill.`);
        }

        const spheres = ((id !== squadFillerMapping.EMPTY && Array.isArray(unit.spheres)) ? unit.spheres : [])
          .filter(sphere => isValidSphere(getItem(sphere)));
        if (!Array.isArray(unit.spheres)) {
          messages.push(`${unitIdentifer} has invalid sphere entry. Used default of no spheres.`);
        } else if (spheres.length !== unit.spheres.length) {
          messages.push(`${unitIdentifer} has invalid spheres [${unit.spheres.filter(s => !spheres.includes(s)).join(', ')}]. Removed them from the entry.`);
        }

        const sp = (id !== squadFillerMapping.EMPTY && unitData.feskills && typeof unit.sp === 'string')
          ? unit.sp.split('').filter(code => unitData.feskills[spCodeToIndex(code)]).join('')
          : undefined;
        if (sp !== unit.sp && !!unit.sp) {
          const message = [
            `${unitIdentifer} has invalid SP code [${unit.sp}].`,
            sp ? `Set SP code to [${sp}].` : `Removed SP code.`,
          ].join(' ');
          messages.push(message);
        }

        units.push(makeSquadUnitEntry({
          id,
          position,
          bbOrder,
          action,
          es: extraSkill,
          spheres,
          sp,
        }));
      } else {
        messages.push(`Unit at input index ${i} is invalid and has been removed from squad.`);
      }
    });
  }

  // fill in units with invalid positions and bbOrders
  const possibleOrders = (new Array(6).fill(0).map((_, i) => i + 1));
  units.forEach(unit => {
    if (!unit.position) {
      unit.position = unitPositionMapping.find(p => !filledPositions.has(p));
      filledPositions.add(unit.position);
    }

    if (!unit.bbOrder) {
      unit.bbOrder = possibleOrders.find(order => !usedOrders.has(order));
      usedOrders.add(unit.bbOrder);
    }
  });

  if (units.length < 6) {
    messages.push(`${units.length} valid units found. Added ${6 - units.length} filler units.`);
  }
  for (let i = units.length; i < 6; ++i) {
    const position = unitPositionMapping.find(p => !filledPositions.has(p));
    filledPositions.add(position);

    const bbOrder = possibleOrders.find(order => !usedOrders.has(order));
    usedOrders.add(bbOrder);

    units.push(generateFillerSquadUnitEntry({
      position,
      bbOrder,
    }));
  }

  // remove lead/friend if those values are invalid
  if (!units[lead] || units[lead].id === squadFillerMapping.EMPTY) {
    messages.push(`Unit at index ${lead} cannot be leader because it is invalid or empty. Removed leader indicator.`);
    lead = -1;
  }
  if (!units[friend] || units[friend].id === squadFillerMapping.EMPTY) {
    messages.push(`Unit at index ${lead} cannot be friend leader because it is invalid or empty. Removed friend leader indicator.`);
    friend = -1;
  }

  // remove friend lead if lead and friend refer to the same unit
  if (lead !== -1 && friend !== -1 && lead === friend) {
    messages.push(`Unit at index ${lead} cannot be lead and friend lead. Removed friend leader indicator.`);
    friend = -1;
  }

  return {
    lead,
    friend,
    name: squad.name || 'Default Squad Name',
    units: sortUnitsByPosition(units),
    warnings: messages,
  };
}

export function getMultidexDatabaseIdsFromSquads (squads = [generateDefaultSquad()]) {
  const unitIds = new Set(), esIds = new Set(), itemIds = new Set();
  const squadsToCheck = Array.isArray(squads) ? squads : [squads];
  squadsToCheck.forEach(squad => {
    squad.units.forEach(unit => {
      unitIds.add(unit.id);
      if (unit.es) {
        esIds.add(unit.es);
      }
      if (unit.spheres.length > 0) {
        unit.spheres.forEach(id => {
          itemIds.add(id);
        });
      }
    });
  });
  return {
    units: Array.from(unitIds),
    extraSkills: Array.from(esIds),
    items: Array.from(itemIds),
  };
}

export function sortUnitsByPosition (units = [], clone = true) {
  const toSort = clone ? units.slice() : units;
  return toSort.sort((a, b) => {
    const [positionA, positionB] = [unitPositionMapping.indexOf(a.position), unitPositionMapping.indexOf(b.position)];
    return positionA - positionB;
  });
}
