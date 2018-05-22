import Vue from 'vue';
import Vuex from 'vuex';
import SettingsModule from './modules/settings';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    settings: SettingsModule,
  },
  strict: true,
});

export default store;
