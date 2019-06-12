export default {
  SquadList: () => import(/* webpackChunkName: "squads" */ './SquadList.vue'),
  Squads: () => import(/* webpackChunkName: "squads" */ './Squad.vue'),
  AddSquad: () => import(/* webpackChunkName: "squads" */ './SquadAdd.vue'),
  Compare: () => import(/* webpackChunkName: "compare" */ './Compare.vue'),
};
