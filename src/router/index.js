import Vue from 'vue';
import Router from 'vue-router';
import HelloWorld from '@/components/HelloWorld';

import Home from '@/components/Home';
import News from '@/components/News';
import Units from '@/components/Units';
import Items from '@/components/Items';
import Squad from '@/components/Squad';
import Summoner from '@/components/Summoner';

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
      path: '/news',
      name: 'News',
      component: News,
    },
    {
      path: '/units',
      name: 'Units',
      component: Units,
      props: true,
    },
    {
      path: '/items',
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
