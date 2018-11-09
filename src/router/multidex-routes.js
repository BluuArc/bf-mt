import MultidexPages from '@/views/Multidex';
import FilterHelper from '@/modules/FilterOptionsHelper';

const filterHelper = new FilterHelper();

const defaultMultidexPropHandler = route => ({
  query: route.query.q,
  viewId: route.query.viewId,
  server: route.query.server,
  filters: filterHelper.stringToOptions(route.query.filters),
});

export default [
  {
    path: '/multidex/units',
    name: 'Units',
    component: MultidexPages.Units,
    props: defaultMultidexPropHandler,
  },
  {
    path: '/multidex/items',
    name: 'Items',
    component: MultidexPages.Items,
    props: defaultMultidexPropHandler,
  },
  {
    path: '/multidex/bursts',
    name: 'Bursts',
    component: MultidexPages.Bursts,
    props: defaultMultidexPropHandler,
  },
  {
    path: '/multidex/extra-skills',
    name: 'Extra Skills',
    component: MultidexPages.ExtraSkills,
    props: defaultMultidexPropHandler,
  },
  {
    path: '/multidex/leader-skills',
    name: 'Leader Skills',
    component: MultidexPages.LeaderSkills,
    props: defaultMultidexPropHandler,
  },
  {
    path: '/multidex/missions',
    name: 'Missions',
    component: MultidexPages.Missions,
    props: defaultMultidexPropHandler,
  },
  {
    path: '/multidex/dictionary',
    name: 'Dictionary',
    component: MultidexPages.Dictionary,
    props: defaultMultidexPropHandler,
  },
];
