import Vue from 'vue';
import Router from 'vue-router';
import HelloWorld from '@/components/HelloWorld';

import Home from '@/components/Home';
import News from '@/components/News';
import Multidex from '@/components/Multidex';
import Units from '@/components/Units';
import Items from '@/components/Items';
import Squad from '@/components/Squad';
import Summoner from '@/components/Summoner';

import Settings from '@/components/Settings';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/Hello',
      name: 'HelloWorld',
      component: HelloWorld,
    },
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
    },
    {
      path: '/news',
      name: 'News',
      component: News,
    },
    {
      path: '/multidex',
      name: 'Multidex',
      component: Multidex,
    },
    {
      path: '/multidex/units',
      name: 'Units',
      component: Units,
      props: true,
    },
    {
      path: '/multidex/items',
      name: 'Items',
      component: Items,
    },
    {
      path: '/squad',
      name: 'Squad',
      component: Squad,
    },
    {
      path: '/summoner',
      name: 'Summoner',
      component: Summoner,
    },
  ],
});
