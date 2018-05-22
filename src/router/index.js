import Vue from 'vue';
import Router from 'vue-router';
import HomePage from '@/components/Home/Main';
import NewsPage from '@/components/News/Main';

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
  ],
});
