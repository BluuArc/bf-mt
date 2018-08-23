import MultidexPages from '@/views/Multidex';

const defaultMultidexPropHandler = route => ({
  query: route.query.q,
  viewId: route.query.viewId,
  server: route.query.server,
});

export default [
  {
    path: '/multidex/units',
    name: 'Units',
    component: MultidexPages.Units,
    props: defaultMultidexPropHandler,
  },
];
