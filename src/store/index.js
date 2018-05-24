import Vue from 'vue';
import Vuex from 'vuex';
import SettingsModule from './modules/settings';
import UnitsModule from './modules/units';
import ItemsModule from './modules/items';
import BurstModule from './modules/bursts';
import ExtraSkillModule from './modules/extra-skills';

Vue.use(Vuex);
const modules = ['settings', 'units', 'items', 'bursts', 'extraSkills'];
const store = new Vuex.Store({
  modules: {
    settings: SettingsModule,
    units: UnitsModule,
    items: ItemsModule,
    bursts: BurstModule,
    extraSkills: ExtraSkillModule,
  },
  actions: {
    async init ({ dispatch, state }) {
      for (const m of modules) {
        await dispatch(`${m}/init`);
      }

      await dispatch('setActiveServer', state.settings.activeServer);
    },
    async setActiveServer ({ dispatch }, server = 'gl') {
      for (const m of modules) {
        await dispatch(`${m}/setActiveServer`, server);
      }
    },
  },
  strict: true,
});

export default store;
