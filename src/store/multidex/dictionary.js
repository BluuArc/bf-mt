import { Logger } from '@/modules/Logger';
import { makeMultidexWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions, createGetters } from './helper';
import { getCacheBustingUrlParam } from '@/modules/utils';
// import SWorker from '@/assets/sww.min';
// import union from 'lodash/union';

const logger = new Logger({ prefix: '[STORE/DICTIONARY]' });
const dbWorker = makeMultidexWorker('dictionary');
export default {
  namespaced: true,
  state: createState(),
  mutations: createMutations(logger),
  getters: {
    ...createGetters('dictionary'),
  },
  actions: {
    ...createActions(dbWorker, downloadWorker, logger, 'dictionary'),
    async updateData ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      const baseUrl = `${location.origin}${location.pathname}static/bf-data`;
      const cacheBustingParam = getCacheBustingUrlParam();
      for (const server of servers) {
        const logPrefix = `Downloading data for ${server.toUpperCase()} server`;
        commit('setLoadingMessage', logPrefix);
        const tempLogger = new Logger({ prefix: `[STORE/DICTIONARY-${server.toUpperCase()}]` });
        try {
          const pageDb = {};
          const loadPromises = [];
          let countFinished = 0;
          for (let i = 1; i <= 9; ++i) {
            const url = `${baseUrl}/dictionary-${server}-${i}.json?${cacheBustingParam}`;
            loadPromises.push(downloadWorker
              .postMessage('getJson', [url])
              .then(tempData => {
                Object.keys(tempData)
                  .forEach(id => {
                    pageDb[id] = tempData[id].en || '';
                  });
                tempLogger.debug('finished getting', url, 10 - (++countFinished), 'files remaining');
                commit('setLoadingMessage', `${logPrefix} (${10 - countFinished} files remaining)`);
              }));
          }

          await Promise.all(loadPromises);
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

