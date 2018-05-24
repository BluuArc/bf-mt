import Vue from 'vue';
import Vuex from 'vuex';
import SettingsModule from './modules/settings';
import UnitsModule from './modules/units';
import ItemsModule from './modules/items';
import BurstModule from './modules/bursts';
import ExtraSkillModule from './modules/extra-skills';
import LeaderSkillModule from './modules/leader-skills';

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
  actions: {
    async init ({ dispatch, state, commit }) {
      for (const m of modules.slice(1)) {
        commit(`${m}/setLoadState`, true);
      }

      for (const m of modules) {
        console.debug('initializing', m);
        await dispatch(`${m}/init`);
        if (m !== 'settings') {
          commit(`${m}/setLoadState`, true);
        }
      }

      await dispatch('setActiveServer', state.settings.activeServer);
    },
    async setActiveServer ({ dispatch, commit }, server = 'gl') {
      for (const m of modules.slice(1)) {
        commit(`${m}/setLoadState`, true);
      }

      for (const m of modules) {
        await dispatch(`${m}/setActiveServer`, server);
      }
    },
  },
  strict: true,
});

export default store;
