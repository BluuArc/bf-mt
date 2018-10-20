export default {
  Units: () => import(/* webpackChunkName: "units" */ './Units.vue'),
  Items: () => import(/* webpackChunkName: "items" */ './Items.vue'),
  Bursts: () => import( /* webpackChunkName: "bursts" */ './Bursts.vue'),
};
