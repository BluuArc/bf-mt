import { Logger } from '@/modules/Logger';
import { makeMultidexWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions, createGetters } from './helper';
// import SWorker from '@/assets/sww.min';
// import union from 'lodash/union';

const logger = new Logger({ prefix: '[STORE/EXTRA-SKILLS]' });
const dbWorker = makeMultidexWorker('extraSkills');
export default {
  namespaced: true,
  state: createState(),
  mutations: createMutations(logger),
  getters: {
    ...createGetters('extra-skills'),
  },
  actions: {
    ...createActions(dbWorker, downloadWorker, logger, 'extraSkills'),
    async updateData ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      const baseUrl = `${location.origin}${location.pathname}static/bf-data`;
      for (const server of servers) {
        const logPrefix = `Downloading data for ${server.toUpperCase()} server`;
        commit('setLoadingMessage', logPrefix);
        const tempLogger = new Logger({ prefix: `[STORE/EXTRA-SKILLS-${server.toUpperCase()}]` });
        try {
          const pageDb = await downloadWorker.postMessage('getJson', [`${baseUrl}/es-${server}.json`]);
          commit('setLoadingMessage', `Storing data for ${server.toUpperCase()} server`);
          await dispatch('saveData', { data: pageDb, server });
          tempLogger.debug('finished updating data');
        } catch (err) {
          tempLogger.error(err);
        }
      }
      logger.debug('finished updating data');
      commit('setLoadState', false);
    },
  },
};

