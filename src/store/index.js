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
    async init ({ dispatch, state }) {
      await dispatch('settings/settingsInit');
      await dispatch('units/unitsInit');

      await dispatch('setActiveServer', state.settings.activeServer);
    },
    async setActiveServer ({ dispatch }, server = 'gl') {
      await dispatch('settings/setActiveServer', server);
      await dispatch('units/setActiveServer', server);
    },
  },
  strict: true,
});

export default store;
