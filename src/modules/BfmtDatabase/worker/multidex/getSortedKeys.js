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
