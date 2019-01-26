import { commonSorts, applySorts } from './utils';
import {
  elements,
  itemTypes,
} from '@/modules/constants';

function sortWrapper ({ keys = [], sortOptions = {}, sortTypes = {}}) {
  const { type = 'ID', isAscending = true } = sortOptions;
  return applySorts({
    input: keys,
    sortFn: sortTypes[type],
    isAscending,
  });
}

export function units ({ keys, db, sortOptions }) {
  return sortWrapper({
    keys,
    sortOptions,
    sortTypes: {
      'Unit ID': commonSorts.ID,
      'Guide ID': (idA, idB) => commonSorts.Numerical(idA, idB, (id) => +db[id].guide_id),
      Alphabetical: (idA, idB) => commonSorts.Alphabetical(idA, idB, (id) => db[id].name),
      Rarity: (idA, idB) => commonSorts.Numerical(idA, idB, (id) => +db[id].rarity),
      Elements: (idA, idB) => commonSorts.Numerical(idA, idB, (id) => elements.indexOf(db[id].element)),
    },
  });
}

export function items ({ keys, db, sortOptions }) {
  return sortWrapper({
    keys,
    sortOptions,
    sortTypes: {
      'Item ID': commonSorts.ID,
      Alphabetical: (idA, idB) => commonSorts.Alphabetical(idA, idB, (id) => db[id].name),
      Rarity: (idA, idB) => commonSorts.Numerical(idA, idB, (id) => +db[id].rarity),
      Type: (idA, idB) => commonSorts.Numerical(idA, idB, (id) => itemTypes.indexOf(db[id].type)),
      'Sell Price': (idA, idB) => commonSorts.Numerical(idA, idB, (id) => +db[id].sell_price),
    },
  });
}

export function bursts ({ keys, db, sortOptions }) {
  return sortWrapper({
    keys,
    sortOptions,
    sortTypes: {
      'Burst ID': commonSorts.ID,
      Alphabetical: (idA, idB) => commonSorts.Alphabetical(idA, idB, (id) => db[id].name),
    },
  });
}

export function extraSkills ({ keys, db, sortOptions }) {
  return sortWrapper({
    keys,
    sortOptions,
    sortTypes: {
      'Skill ID': commonSorts.ID,
      Alphabetical: (idA, idB) => commonSorts.Alphabetical(idA, idB, (id) => db[id].name),
      Rarity: (idA, idB) => commonSorts.Numerical(idA, idB, (id) => +db[id].rarity),
    },
  });
}

export function leaderSkills ({ keys, db, sortOptions }) {
  return sortWrapper({
    keys,
    sortOptions,
    sortTypes: {
      'Skill ID': commonSorts.ID,
      Alphabetical: (idA, idB) => commonSorts.Alphabetical(idA, idB, (id) => db[id].name),
    },
  });
}

export function missions ({ keys, db, sortOptions = {} }) {
  const {
    possibleValues = { land: [], area: [], dungeon: [] },
  } = sortOptions;

  const calculateXpPerEnergy = (xp = 0, en = 0) => xp / (Math.max(1, en));
  return sortWrapper({
    keys,
    sortOptions,
    sortTypes: {
      'Mission ID': commonSorts.ID,
      Alphabetical: (idA, idB) => commonSorts.Alphabetical(idA, idB, (id) => db[id].name),
      Energy: (idA, idB) => commonSorts.Numerical(idA, idB, (id) => +db[id].energy_use),
      'Battle Count': (idA, idB) => commonSorts.Numerical(idA, idB, (id) => +db[id].battle_count),
      Rarity: (idA, idB) => commonSorts.Numerical(idA, idB, (id) => +db[id].rarity),
      Map: (idA, idB) => {
        const [missionA, missionB] = [db[idA], db[idB]];
        const { land: landA, area: areaA, dungeon: dungeonA } = missionA;
        const { land: landB, area: areaB, dungeon: dungeonB } = missionB;
        let numA, numB;
        // missions are categorized as land/area/dungeon/name
        if (landA === landB) {
          if (areaA === areaB) {
            [numA, numB] = [possibleValues.dungeon.indexOf(dungeonA), possibleValues.dungeon.indexOf(dungeonB)];
          } else {
            [numA, numB] = [possibleValues.area.indexOf(areaA), possibleValues.area.indexOf(areaB)];
          }
        } else {
          [numA, numB] = [possibleValues.land.indexOf(landA), possibleValues.land.indexOf(landB)];
        }
        return (numA !== numB) ? (numA - numB) : commonSorts.ID(idA, idB);
      },
      XP: (idA, idB) => commonSorts.Numerical(idA, idB, (id) => +db[id].xp),
      'XP/EN': (idA, idB) => commonSorts.Numerical(idA, idB, (id) => calculateXpPerEnergy(+db[id].xp, +db[id].energy_use)),
    },
  });
}
