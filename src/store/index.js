import Vue from 'vue';
import Vuex from 'vuex';
import SettingsModule from './modules/settings';
import UnitsModule from './modules/units';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    settings: SettingsModule,
    units: UnitsModule,
  },
  actions: {
    async init ({ dispatch }) {
      await dispatch('settings/settingsInit');
      await dispatch('units/unitsInit');
    },
  },
  strict: true,
});

export default store;
