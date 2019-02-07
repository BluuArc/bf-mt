import ToolsPages from '@/views/Tools';

export const squadRequiredModules = Object.freeze(['units', 'extraSkills', 'items']);

export default [
  {
    path: '/tools/squads',
    name: 'Squad List',
    component: ToolsPages.SquadList,
    meta: {
      requiredModules: squadRequiredModules,
    },
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
];
