import Vue from 'vue';
import Vuex from 'vuex';
import debounce from 'lodash/debounce';
import { delay } from '@/modules/utils';
import getUpdateTimes from './instances/update-data-singleton';
import settings from './settings';
import github from './github';
import multidexModules, { moduleInfo as multidexModuleInfo } from './multidex';
import squads from './tools/squads';

import { Logger } from '@/modules/Logger';
const logger = new Logger({ prefix: '[STORE]' });

Vue.use(Vuex);
export const moduleInfo = Object.freeze([
  {
    name: 'settings',
    fullName: 'Settings',
    link: '/settings',
  },
  {
    name: 'github',
    fullName: 'GitHub Commits',
    link: '/',
  },
  ...multidexModuleInfo,
]);

export default new Vuex.Store({
  modules: {
    settings,
    github,
    ...multidexModules,
    squads,
  },
  state: {
    disableHtmlOverflow: false,
    inInitState: true,
    updateTimes: {},
    loadingMessage: '',
    loadingState: false, // changed mostly by MultidexDataWrapper, accessed by all
    iconKeyConfigCache: {},
    maxColumnWidthForBuffTable: 0,
    showBbOrderColors: false,
  },
  mutations: {
    setInitState (state, newState = false) {
      state.inInitState = !!newState;
    },
    setLoadingMessage (state, message = '') {
      logger.debug('LOADING MESSAGE:', message);
      state.loadingMessage = message;
    },
    setUpdateTimes (state, newTimes = {}) {
      state.updateTimes = newTimes;
    },
    setLoadingState (state, value) {
      state.loadingState = !!value;
    },
    setHtmlOverflowDisableState (state, value) {
      state.disableHtmlOverflow = !!value;
    },
    setValueForIconKey (state, { key, value }) {
      state.iconKeyConfigCache[key] = value;
    },
    setMaxColumnWidthForBuffTable (state, newVal) {
      state.maxColumnWidthForBuffTable = +newVal;
    },
    setShowSparkOrderColors (state, newVal) {
      state.showBbOrderColors = !!newVal;
    },
  },
  actions: {
    setLoadingStateDebounced: debounce(async function({ commit, state }, valueGetter) {
      const newValue = !!valueGetter();
      if (state.loadingState !== newValue) {
        await delay(0);
        commit('setLoadingState', newValue);
      }
    }, 500),
    async init ({ dispatch, state, commit }) {
      commit('setInitState', true);
      const modules = moduleInfo.map(({ name }) => name);
      multidexModuleInfo.forEach(({ name }) => {
        commit(`${name}/setLoadState`, true);
      });

      try {
        commit('setLoadingMessage', 'Initializing data');
        await delay(0);
        for (const m of modules) {
          logger.debug('initializing', m);
          await dispatch(`${m}/init`);
          if (m !== 'settings' && m !== 'github') {
            commit(`${m}/setLoadState`, true);
          }
        }
        await dispatch('settings/init');
  
        commit('setLoadingMessage', `Setting data to last set server (${(state.settings.activeServer || 'gl').toUpperCase()})`);
        await dispatch('setActiveServer', state.settings.activeServer);
      } catch (err) {
        throw err;
      } finally {
        commit('setLoadingMessage');
        commit('setInitState', false);
      }
    },
    async setActiveServer ({ dispatch, commit }, server = 'gl') { // eslint-disable-line no-unused-vars
      const modules = moduleInfo.map(({ name }) => name);
      multidexModuleInfo.forEach(({ name }) => {
        commit(`${name}/setLoadState`, true);
      });

      commit('setLoadingState', true);
      commit('setLoadingMessage', `Switching active server to ${server}`);
      await delay(0);
      for (const m of modules.filter(m => m !== 'github')) {
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
      commit('setLoadingMessage', '');
      commit('setLoadingState', false);
    },
    async fetchUpdateTimes ({ commit }, forceRefresh) {
      const updateTimes = await getUpdateTimes(forceRefresh);
      commit('setUpdateTimes', updateTimes);
    },
  },
  strict: true,
});
