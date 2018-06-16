import dbWorker from '../instances/dexie-client';
const settingsDb = dbWorker.setTable('settings');

// user entry for dexie db
const user = 'me';

const settingsStore = {
  namespaced: true,
  state: {
    lightMode: false,
    activeServer: 'gl',
  },
  mutations: {
    setLightMode (state, mode) {
      state.lightMode = !!mode;
    },
    setActiveServer (state, server = 'gl') {
      state.activeServer = server;
    },
  },
  actions: {
    // load settings from cache
    async init ({ commit, dispatch }) {
      const currentSettings = await dispatch('getCurrentSettings');
      console.debug(currentSettings);
      await dispatch('setLightMode', currentSettings.lightMode);
      await dispatch('setActiveServer', currentSettings.activeServer);
    },
    async setLightMode ({ commit, dispatch }, mode) {
      const data = await dispatch('getCurrentSettings');
      console.debug('current settings:', data, 'new mode:', mode);
      await settingsDb.put(
        {
          user,
          data: {
            ...data,
            lightMode: !!mode,
          },
        }
      );
      commit('setLightMode', mode);
    },
    async setActiveServer ({ commit, dispatch }, server = 'gl') {
      if (!['gl', 'eu', 'jp'].includes(server)) {
        throw Error(`Invalid server "${server}"`);
      }

      const data = await dispatch('getCurrentSettings');
      console.debug('current settings:', data, 'new server:', server);
      await settingsDb.put({
        user,
        data: {
          ...data,
          activeServer: server,
        },
      });
      commit('setActiveServer', server);
    },
    getCurrentSettings () {
      return settingsDb.get({ user })
        .then(results => {
          return results.length === 0 ? {} : results[0].data;
        });
    },
  },
};

export default settingsStore;
