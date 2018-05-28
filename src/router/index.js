import Vue from 'vue';
import Router from 'vue-router';
import HomePage from '@/components/Home/Main';
import NewsPage from '@/components/News/Main';
import SettingsPage from '@/components/Settings/Main';

import MultidexPage from '@/components/Multidex/Main';
import UnitsPage from '@/components/Multidex/Units/Main';
import ItemsPage from '@/components/Multidex/Items/Main';
import BurstsPage from '@/components/Multidex/Bursts/Main';
import ExtraSkillsPage from '@/components/Multidex/ExtraSkills/Main';
import LeaderSkillsPage from '@/components/Multidex/LeaderSkills/Main';

Vue.use(Router);

export default new Router({
  routes: [
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
      props: route => ({ query: route.query.q, unitId: route.query.unitId }),
    },
    {
      path: '/multidex/items',
      name: 'Items',
      component: ItemsPage,
      props: route => ({ query: route.query.q, itemId: route.query.itemId }),
    },
    {
      path: '/multidex/bursts',
      name: 'Bursts',
      component: BurstsPage,
      props: route => ({ query: route.query.q, burstId: route.query.burstId }),
    },
    {
      path: '/multidex/extra-skills',
      name: 'Extra Skills',
      component: ExtraSkillsPage,
      props: route => ({ query: route.query.q, extraId: route.query.extraId }),
    },
    {
      path: '/multidex/leader-skills',
      name: 'Leader Skills',
      component: LeaderSkillsPage,
      props: route => ({ query: route.query.q, leaderId: route.query.leaderId }),
    },
  ],
});
