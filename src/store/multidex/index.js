import units from './units';
import items from './items';
import bursts from './bursts';

export const moduleInfo = Object.freeze([
  {
    name: 'units',
    fullName: 'Units',
    type: 'multidex',
    link: '/multidex/units',
  },
  {
    name: 'items',
    fullName: 'Items',
    type: 'multidex',
    link: '/multidex/items',
  },
  {
    name: 'bursts',
    fullName: 'Bursts',
    type: 'multidex',
    link: '/multidex/bursts',
  },
  // {
  //   name: 'extraSkills',
  //   fullName: 'Extra Skills',
  //   type: 'multidex',
  //   link: '/multidex/extra-skills',
  // },
  // {
  //   name: 'leaderSkills',
  //   fullName: 'Leader Skills',
  //   type: 'multidex',
  //   link: '/multidex/leader-skills',
  // },
  // {
  //   name: 'missions',
  //   fullName: 'Missions',
  //   type: 'multidex',
  //   link: '/multidex/missions',
  // },
  // {
  //   name: 'dictionary',
  //   fullName: 'Dictionary',
  //   type: 'multidex',
  //   link: '/multidex/dictionary',
  // },
])
export default { units, items, bursts };
