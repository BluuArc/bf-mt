import Vue from 'vue';
import Router from 'vue-router';
import HomePage from '@/components/Home/Main';
import NewsPage from '@/components/News/Main';
import SettingsPage from '@/components/Settings/Main';
import DebugPage from '@/components/DebugPage';

import MultidexPage from '@/components/Multidex/Main';
import UnitsPage from '@/components/Multidex/Units/Main';
import ItemsPage from '@/components/Multidex/Items/Main';
import BurstsPage from '@/components/Multidex/Bursts/Main';
import ExtraSkillsPage from '@/components/Multidex/ExtraSkills/Main';
import LeaderSkillsPage from '@/components/Multidex/LeaderSkills/Main';
import MissionsPage from '@/components/Multidex/Missions/Main';

Vue.use(Router);

const defaultMultidexPropHandler = route => ({
  query: route.query.q,
  viewId: route.query.viewId,
  server: route.query.server,
});

export default new Router({
  routes: [
    {
      path: '/debug',
      name: 'Debug',
      component: DebugPage,
      props: defaultMultidexPropHandler,
    },
    {
      path: '/',
      name: 'Home',
      component: HomePage,
    },
    {
      path: '/news',
      name: 'News & Events',
      component: NewsPage,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: SettingsPage,
    },
    {
      path: '/multidex',
      name: 'Multidex Overview',
      component: MultidexPage,
    },
    {
      path: '/multidex/units',
      name: 'Units',
      component: UnitsPage,
      props: defaultMultidexPropHandler,
    },
    {
      path: '/multidex/items',
      name: 'Items',
      component: ItemsPage,
      props: defaultMultidexPropHandler,
    },
    {
      path: '/multidex/bursts',
      name: 'Bursts',
      component: BurstsPage,
      props: defaultMultidexPropHandler,
    },
    {
      path: '/multidex/extra-skills',
      name: 'Extra Skills',
      component: ExtraSkillsPage,
      props: defaultMultidexPropHandler,
    },
    {
      path: '/multidex/leader-skills',
      name: 'Leader Skills',
      component: LeaderSkillsPage,
      props: defaultMultidexPropHandler,
    },
    {
      path: '/multidex/missions',
      name: 'Missions',
      component: MissionsPage,
      props: defaultMultidexPropHandler,
    },
  ],
});
