export default {
  Units: () => import(/* webpackChunkName: "units" */ './Units.vue'),
  Items: () => import(/* webpackChunkName: "items" */ './Items.vue'),
  Bursts: () => import( /* webpackChunkName: "bursts" */ './Bursts.vue'),
  ExtraSkills: () => import( /* webpackChunkName: "extraSkills" */ './ExtraSkills.vue'),
  LeaderSkills: () => import( /* webpackChunkName: "leaderSkills" */ './LeaderSkills.vue'),
  Missions: () => import( /* webpackChunkName: "missions" */ './Missions.vue'),
  Dictionary: () => import( /* webpackChunkName: "dictionary" */ './Dictionary.vue'),
};
