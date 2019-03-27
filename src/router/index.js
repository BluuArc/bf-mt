import Vue from 'vue';
import Router from 'vue-router';

import NotFound from '@/views/NotFound.vue';
import Home from '@/views/Home.vue';
import Settings from '@/views/Settings.vue';
import News from '@/views/News.vue';
import Debug from '@/views/Debug.vue';

import multidexRoutes from './multidex-routes';
import toolRoutes from './tool-routes';

Vue.use(Router);
const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    // },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
    },
    {
      path: '/news',
      name: 'News & Events',
      component: News,
    },
    {
      path: '/debug',
      name: 'Debug',
      component: Debug,
    },
    ...multidexRoutes,
    ...toolRoutes,
    {
     path: '/not-found',
     name: 'Not Found',
     component: NotFound,
    },
    {
      path: '*',
      redirect: '/not-found',
    },
  ],
});

router.beforeEach((to, from, next) => {
  const setTitle = !to.path.includes('multidex') || !(to.query.viewId || to.query.filters);
  if (setTitle) {
    document.title = `BF-MT - ${to.name}`;
  }
  next();
});

export default router;
