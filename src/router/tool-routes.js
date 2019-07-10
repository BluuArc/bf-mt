import ToolsPages from '@/views/Tools';
import { servers } from '@/modules/constants';

export const squadRequiredModules = Object.freeze(['units', 'extraSkills', 'items']);

export default [
  {
    path: '/tools/squads',
    name: 'Squad List',
    component: ToolsPages.SquadList,
  },
  {
    path: '/tools/squads/add',
    name: 'Add Squad',
    component: ToolsPages.AddSquad,
    props: (route) => ({
      importSquad: route.query.import,
    }),
  },
  {
    path: '/tools/squads/:id',
    name: 'Squad',
    component: ToolsPages.Squads,
    props: true,
    meta: {
      requiredModules: squadRequiredModules,
    },
  },
  {
    path: '/tools/compare',
    name: 'Compare',
    component: ToolsPages.Compare,
    props: (route) => ({
      server: servers.includes(route.query.server) ? route.query.server : 'gl',
      input: route.query.input || '',
    }),
  },
  {
    path: '/tools/tier-list-creator',
    name: 'Tier List Creator',
    component: ToolsPages.TierListCreator,
    props: (route) => ({
      server: servers.includes(route.query.server) ? route.query.server : 'gl',
      categories: route.query.categories || '',
      entries: route.query.entries || '',
    }),
  },
];
