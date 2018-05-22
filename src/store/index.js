import Vue from 'vue';
import Vuex from 'vuex';
import SettingsModule from './modules/settings';
import UnitsModule from './modules/units';
import ItemsModule from './modules/items';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    settings: SettingsModule,
    units: UnitsModule,
    items: ItemsModule,
  },
  actions: {
    async init ({ dispatch, state }) {
      await dispatch('settings/settingsInit');
      await dispatch('units/init');
      await dispatch('items/init');

      await dispatch('setActiveServer', state.settings.activeServer);
    },
    async setActiveServer ({ dispatch }, server = 'gl') {
      await dispatch('settings/setActiveServer', server);
      await dispatch('units/setActiveServer', server);
      await dispatch('items/setActiveServer', server);
    },
  },
  strict: true,
});

export default store;
