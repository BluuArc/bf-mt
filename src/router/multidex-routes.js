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
];
