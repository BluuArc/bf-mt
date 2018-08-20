import Vue from 'vue';
import Vuex from 'vuex';
import settings from './settings';

Vue.use(Vuex);
export const moduleInfo = Object.freeze([{
    name: 'settings',
    fullName: 'Settings',
    link: '/settings',
  },
  {
    name: 'units',
    fullName: 'Units',
    type: 'multidex',
    link: '/multidex/units',
  },
  {
    name: 'items',
    fullName: 'Items',
    type: 'multidex',
    link: '/multidex/items',
  },
  {
    name: 'bursts',
    fullName: 'Bursts',
    type: 'multidex',
    link: '/multidex/bursts',
  },
  {
    name: 'extraSkills',
    fullName: 'Extra Skills',
    type: 'multidex',
    link: '/multidex/extra-skills',
  },
  {
    name: 'leaderSkills',
    fullName: 'Leader Skills',
    type: 'multidex',
    link: '/multidex/leader-skills',
  },
  {
    name: 'missions',
    fullName: 'Missions',
    type: 'multidex',
    link: '/multidex/missions',
  },
  {
    name: 'dictionary',
    fullName: 'Dictionary',
    type: 'multidex',
    link: '/multidex/dictionary',
  },
]);

export default new Vuex.Store({
  modules: {
    settings,
  },
  state: {
    disableHtmlOverflow: false,
    inInitState: false,
    loadingMessage: '',
  },
  mutations: {
    setInitState (state, newState = false) {
      state.inInitState = !!newState;
    },
    setLoadingMessage (state, message = '') {
      state.loadingMessage = message;
    },
  },
  actions: {
    async init ({ dispatch, state, commit }) {
      commit('setInitState', true);
      // TODO: set load state of multidex modules

      commit('setLoadingMessage', 'Initializing data');

      // TODO: init multidex modules with settings
      await dispatch('settings/init');

      commit('setLoadingMessage', `Setting data to last set server (${(state.settings.activeServer || 'gl').toUpperCase()})`);
      await dispatch('setActiveServer', state.settings.activeServer);
      commit('setLoadingMessage');
      commit('setInitState', false);
    },
    async setActiveServer ({ dispatch, commit }, server = 'gl') { // eslint-disable-line no-unused-vars
      // TODO: set load state of multidex modules

      // TODO: set multidex modules with settings
      await dispatch('settings/setActiveServer', server);
    },
  },
});
