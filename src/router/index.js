import Vue from 'vue';
import Router from 'vue-router';
import HomePage from '@/components/Home/Main';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home Page',
      component: HomePage,
    },
  ],
});
