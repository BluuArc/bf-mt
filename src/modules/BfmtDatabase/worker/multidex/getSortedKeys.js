import { commonSorts, applySorts } from './utils';
import {
  elements,
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
