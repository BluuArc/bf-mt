import db from '../instances/dexie-instance';

const { settings: settingsDb } = db;

// user entry for dexie db
const user = 'me';

const settingsStore = {
  namespaced: true,
  state: {
    darkMode: true,
  },
  mutations: {
    setDarkMode (state, mode) {
      state.darkMode = !!mode;
    },
  },
  actions: {
    // load settings from cache
    async settingsInit ({ commit, dispatch }) {
      const currentSettings = await dispatch('getCurrentSettings');

      await dispatch('setDarkMode', currentSettings.darkMode);
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
    getCurrentSettings () {
      return settingsDb.where({user})
        .toArray()
        .then(results => {
          return results.length === 0 ? {} : results[0].data;
        });
    },
  },
};

export default settingsStore;
