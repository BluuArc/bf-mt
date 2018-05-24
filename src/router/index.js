import Vue from 'vue';
import Router from 'vue-router';
import HomePage from '@/components/Home/Main';
import NewsPage from '@/components/News/Main';
import SettingsPage from '@/components/Settings/Main';
import MultidexPage from '@/components/Multidex/Main';

import UnitsPage from '@/components/Multidex/Units/Main';

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
    },
  ],
});
