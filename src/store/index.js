import Vue from 'vue';
import Vuex from 'vuex';
import SettingsModule from './modules/settings';
import UnitsModule from './modules/units';
import ItemsModule from './modules/items';
import BurstModule from './modules/bursts';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    settings: SettingsModule,
    units: UnitsModule,
    items: ItemsModule,
    bursts: BurstModule,
  },
  actions: {
    async init ({ dispatch, state }) {
      await dispatch('settings/settingsInit');
      await dispatch('units/init');
      await dispatch('items/init');
      await dispatch('bursts/init');

      await dispatch('setActiveServer', state.settings.activeServer);
    },
    async setActiveServer ({ dispatch }, server = 'gl') {
      await dispatch('settings/setActiveServer', server);
      await dispatch('units/setActiveServer', server);
      await dispatch('items/setActiveServer', server);
      await dispatch('bursts/setActiveServer', server);
    },
  },
  strict: true,
});

export default store;
