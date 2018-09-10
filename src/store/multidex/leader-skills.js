import { Logger } from '@/modules/Logger';
import { makeMultidexWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions, createGetters } from './helper';
import { getCacheBustingUrlParam } from '@/modules/utils';
// import SWorker from '@/assets/sww.min';
// import union from 'lodash/union';

const logger = new Logger({ prefix: '[STORE/LEADER-SKILLS]' });
const dbWorker = makeMultidexWorker('leaderSkills');
export default {
  namespaced: true,
  state: createState(),
  mutations: createMutations(logger),
  getters: {
    ...createGetters('leader-skills'),
  },
  actions: {
    ...createActions(dbWorker, downloadWorker, logger, 'leaderSkills'),
    async updateData ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      const baseUrl = `${location.origin}${location.pathname}static/bf-data`;
      const cacheBustingParam = getCacheBustingUrlParam();
      for (const server of servers) {
        const logPrefix = `Downloading data for ${server.toUpperCase()} server`;
        commit('setLoadingMessage', logPrefix);
        const tempLogger = new Logger({ prefix: `[STORE/LEADER-SKILLS-${server.toUpperCase()}]` });
        try {
          const pageDb = await downloadWorker.postMessage('getJson', [`${baseUrl}/ls-${server}.json?${cacheBustingParam}`]);
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

