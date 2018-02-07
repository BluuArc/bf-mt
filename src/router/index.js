import Vue from 'vue';
import Router from 'vue-router';
import HelloWorld from '@/components/HelloWorld';

import Home from '@/components/Home';
import Unit from '@/components/Unit';

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
      path: '/units',
      name: 'Units',
      component: Unit,
    },
  ],
});
