import Vue from 'vue';
import Vuex from 'vuex';
import debounce from 'lodash/debounce';
import getUpdateTimes from './instances/update-data-singleton';
import settings from './settings';
import multidexModules, { moduleInfo as multidexModuleInfo } from './multidex';

import { Logger } from '@/modules/Logger';
const logger = new Logger({ prefix: '[STORE]' });

Vue.use(Vuex);
export const moduleInfo = Object.freeze([
  {
    name: 'settings',
    fullName: 'Settings',
    link: '/settings',
  },
  ...multidexModuleInfo,
]);

export default new Vuex.Store({
  modules: {
    settings,
    ...multidexModules,
  },
  state: {
    disableHtmlOverflow: false,
    inInitState: false,
    updateTimes: {},
    loadingMessage: '',
    loadingState: false, // changed mostly by MultidexDataWrapper, accessed by all
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
    setLoadingState (state, value) {
      state.loadingState = !!value;
    },
  },
  actions: {
    setLoadingStateDebounced: debounce(function({ commit, state }, valueGetter) {
      const newValue = !!valueGetter();
      if (state.loadingState !== newValue) {
        commit('setLoadingState', newValue);
      }
    }, 500),
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
    async fetchUpdateTimes ({ commit }, forceRefresh) {
      const updateTimes = await getUpdateTimes(forceRefresh);
      commit('setUpdateTimes', updateTimes);
    },
  },
  strict: true,
});
