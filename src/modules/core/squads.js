import { unitPositionMapping } from '@/modules/constants';

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
  id = '(Any)',
  position = unitPositionMapping[0],
  es = '',
  spheres = [],
  bbOrder = 0,
  bbType = 'bb',
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
