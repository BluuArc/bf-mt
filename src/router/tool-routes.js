import ToolsPages from '@/views/Tools';

export default [
  {
    path: '/tools/squads',
    name: 'Squad List',
    component: ToolsPages.SquadList,
  },
  {
    path: '/tools/squads/:id',
    name: 'Squad',
    component: ToolsPages.Squads,
    props: true,
  },
];
