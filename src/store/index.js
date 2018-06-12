import Vue from 'vue';
import Vuex from 'vuex';
import SettingsModule from './modules/settings';
import UnitsModule from './modules/units';
import ItemsModule from './modules/items';
import BurstModule from './modules/bursts';
import ExtraSkillModule from './modules/extra-skills';
import LeaderSkillModule from './modules/leader-skills';

const statLogStart = (label, isCollapsed = true) => {
  console.time(label);
  if (isCollapsed) {
    console.groupCollapsed(label);
  } else {
    console.group(label);
  }
};
const statLogEnd = (label) => { console.timeEnd(label); console.groupEnd(); };

Vue.use(Vuex);
const modules = ['settings', 'units', 'items', 'bursts', 'extraSkills', 'leaderSkills'];
const store = new Vuex.Store({
  modules: {
    settings: SettingsModule,
    units: UnitsModule,
    items: ItemsModule,
    bursts: BurstModule,
    extraSkills: ExtraSkillModule,
    leaderSkills: LeaderSkillModule,
  },
  state: {
    disableHtmlOverflow: false,
    inInitState: false,
    modules,
    sortAndFilterSettings: {},
  },
  mutations: {
    setHtmlOverflow (state, overflowState = false) {
      state.disableHtmlOverflow = !!overflowState;
    },
    setInitState (state, newState = false) {
      state.inInitState = !!newState;
    },
    setSortAndFilterSettings (state, { key, filter, sort }) {
      state.sortAndFilterSettings[key] = { filter, sort };
    },
  },
  actions: {
    async init ({ dispatch, state, commit }) {
      commit('setInitState', true);
      for (const m of modules.slice(1)) {
        commit(`${m}/setLoadState`, true);
      }

      statLogStart('overallInit', false);
      statLogStart('initOnly', false);
      for (const m of modules) {
        statLogStart(`init-${m}`);
        console.debug('initializing', m);
        await dispatch(`${m}/init`);
        if (m !== 'settings') {
          commit(`${m}/setLoadState`, true);
        }
        statLogEnd(`init-${m}`);
      }
      statLogEnd('initOnly');

      await dispatch('setActiveServer', state.settings.activeServer);
      statLogEnd('overallInit');
      commit('setInitState', false);
    },
    async setActiveServer ({ dispatch, commit }, server = 'gl') {
      for (const m of modules.slice(1)) {
        commit(`${m}/setLoadState`, true);
      }
      statLogStart('overallServerChange', false);
      for (const m of modules) {
        statLogStart(`serverChange-${m}`);
        await dispatch(`${m}/setActiveServer`, server);
        statLogEnd(`serverChange-${m}`);
      }
      statLogEnd('overallServerChange');
    },
  },
  strict: true,
});

export default store;
