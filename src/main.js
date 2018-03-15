// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import { store, storeMethods } from './store';

Vue.config.productionTip = false;

router.beforeEach((to, from, next) => {
  const loadFields = ['unit', 'item'];
  let nextPath;
  if (to.path.indexOf('multidex') > -1) {
    loadFields.forEach((field) => {
      if (to.path === `/multidex/${field}s`
        && !storeMethods[`${field}DataLoaded`](store.state)) {
        nextPath = '/multidex';
      }
    });
  }

  next(nextPath);
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
});
