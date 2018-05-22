import dbWorker from '../instances/dexie-client';
const settingsDb = dbWorker.setTable('settings');

// user entry for dexie db
const user = 'me';

const settingsStore = {
  namespaced: true,
  state: {
    darkMode: true,
    activeServer: 'gl',
  },
  mutations: {
    setDarkMode (state, mode) {
      state.darkMode = !!mode;
    },
    setActiveServer (state, server = 'gl') {
      state.activeServer = server;
    },
  },
  actions: {
    // load settings from cache
    async settingsInit ({ commit, dispatch }) {
      const currentSettings = await dispatch('getCurrentSettings');
      console.debug(currentSettings);
      await dispatch('setDarkMode', currentSettings.darkMode);
      await dispatch('setActiveServer', currentSettings.activeServer);
    },
    async setDarkMode ({ commit, dispatch }, mode) {
      const data = await dispatch('getCurrentSettings');
      console.debug('current settings:', data, 'new mode:', mode);
      await settingsDb.put(
        {
          user,
          data: {
            ...data,
            darkMode: !!mode,
          },
        }
      );
      commit('setDarkMode', mode);
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
