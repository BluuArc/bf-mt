import { servers } from '@/modules/constants';
import { Logger } from '@/modules/Logger';
import { makeWorker } from './instances/dexie-client';

const settingsDb = makeWorker('settings');
const user = 'me'; // user entry for dexie db
const logger = new Logger({ prefix: '[STORE/SETTINGS]' });

function isValidServer(server) {
  return servers.includes(server);
}

export default {
  namespaced: true,
  state: {
    lightMode: false,
    activeServer: 'gl',
  },
  mutations: {
    setLightMode (state, mode) {
      state.lightMode = !!mode;
    },
    setActiveServer (state, server) {
      logger.assert(isValidServer(server), 'invalid server', server);
      state.activeServer = server;
    }
  },
  actions: {
    getCurrentSettings () {
      return settingsDb.get({ user })
        .then(results => results.length === 0 ? {} : results[0].data);
    },
    async putCurrentSettings ({ state, dispatch }) {
      const currentSettings = await dispatch('getCurrentSettings');
      await dispatch('putSettings', {
        ...currentSettings,
        ...state,
      });
    },
    putSettings(stateHelpers, data) { // eslint-disable-line no-unused-vars
      return settingsDb.put({ user, data });
    },
    async init ({ dispatch, commit }) {
      const currentSettings = await dispatch('getCurrentSettings');
      logger.debug(currentSettings);
      commit('setLightMode', currentSettings.lightMode);
      commit('setActiveServer', currentSettings.activeServer || 'gl');
      await dispatch('putCurrentSettings');
    },
    async setLightMode ({ commit, dispatch }, mode) {
      const data = await dispatch('getCurrentSettings');
      logger.info('setting light mode from', data && data.lightMode, 'to', !!mode);
      await dispatch('putSettings', {
        ...data,
        lightMode: !!mode,
      });
      commit('setLightMode', mode);
    },
    async setActiveServer ({ commit, dispatch }, server) {
      const data = await dispatch('getCurrentSettings');
      const activeServer = isValidServer(server) ? server : 'gl';
      logger.assert(isValidServer(server), 'Invalid server', server, 'Defaulting to', activeServer);

      if (data.activeServer !== activeServer) {
        logger.info('setting server from', data && data.activeServer, 'to', activeServer);
        await dispatch('putSettings', {
          ...data,
          activeServer: server,
        });
      } else {
        logger.debug('skipping updating DB due servers being same');
      }

      commit('setActiveServer', activeServer);
    },
  },
};
