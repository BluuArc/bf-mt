import Vue from 'vue';
import Vuex from 'vuex';
import settings from './settings';
import units from './multidex/units';
import getUpdateTimes from './instances/update-data-singleton';

import { Logger } from '@/modules/logger';
const logger = new Logger({ prefix: '[STORE]' });

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
  // {
  //   name: 'items',
  //   fullName: 'Items',
  //   type: 'multidex',
  //   link: '/multidex/items',
  // },
  // {
  //   name: 'bursts',
  //   fullName: 'Bursts',
  //   type: 'multidex',
  //   link: '/multidex/bursts',
  // },
  // {
  //   name: 'extraSkills',
  //   fullName: 'Extra Skills',
  //   type: 'multidex',
  //   link: '/multidex/extra-skills',
  // },
  // {
  //   name: 'leaderSkills',
  //   fullName: 'Leader Skills',
  //   type: 'multidex',
  //   link: '/multidex/leader-skills',
  // },
  // {
  //   name: 'missions',
  //   fullName: 'Missions',
  //   type: 'multidex',
  //   link: '/multidex/missions',
  // },
  // {
  //   name: 'dictionary',
  //   fullName: 'Dictionary',
  //   type: 'multidex',
  //   link: '/multidex/dictionary',
  // },
]);

export default new Vuex.Store({
  modules: {
    settings,
    units,
  },
  state: {
    disableHtmlOverflow: false,
    inInitState: false,
    updateTimes: {},
    loadingMessage: '',
  },
  mutations: {
    setInitState (state, newState = false) {
      state.inInitState = !!newState;
    },
    setLoadingMessage (state, message = '') {
      state.loadingMessage = message;
    },
    setUpdateTimes (state, newTimes = {}) {
      state.updateTimes = newTimes;
    },
  },
  actions: {
    async init ({ dispatch, state, commit }) {
      commit('setInitState', true);
      const modules = moduleInfo.map(({ name }) => name);
      modules.slice(1).forEach(name => {
        commit(`${name}/setLoadState`, true);
      });

      commit('setLoadingMessage', 'Initializing data');
      for (const m of modules) {
        logger.debug('initializing', m);
        await dispatch(`${m}/init`);
        if (m !== 'settings') {
          commit(`${m}/setLoadState`, true);
        }
      }
      await dispatch('settings/init');

      commit('setLoadingMessage', `Setting data to last set server (${(state.settings.activeServer || 'gl').toUpperCase()})`);
      await dispatch('setActiveServer', state.settings.activeServer);
      commit('setLoadingMessage');
      commit('setInitState', false);
    },
    async setActiveServer ({ dispatch, commit }, server = 'gl') { // eslint-disable-line no-unused-vars
      const modules = moduleInfo.map(({ name }) => name);
      modules.slice(1).forEach(name => {
        commit(`${name}/setLoadState`, true);
      });

      for (const m of modules) {
        try {
          await dispatch(`${m}/setActiveServer`, server);
        } catch (err) {
          logger.error(err);
        } finally {
          if (m !== 'settings') {
            commit(`${m}/setLoadState`, false);
          }
        }
      }
    },
    async fetchUpdateTimes ({ commit }) {
      const updateTimes = await getUpdateTimes();
      commit('setUpdateTimes', updateTimes);
    },
  },
  strict: true,
});
