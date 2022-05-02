import { Logger } from '@/modules/Logger';
import { makeMultidexWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions, createGetters } from './helper';
import { getCacheBustingUrlParam } from '@/modules/utils';
import { getJson } from '@/modules/download-helper';

/**
 * @param {Object} arg0
 * @param {Logger} arg0.logger
 * @param {Function} arg0.commit
 * @param {string} arg0.logPrefix
 */
 async function getDatabaseForGlobal({ logger, commit, logPrefix }) {
  const pageDb = {};
  const loadPromises = [];
  const cacheBustingParam = getCacheBustingUrlParam();

  const fullList = await getJson(`https://joshuacastor.me/bfmt-data/gl/burst/bfmt_update-stats.json?${cacheBustingParam}`);
  const remainingKeys = Object.keys(fullList);
  const totalKeyCount = remainingKeys.length;
  let countFinished = 0;
  logger.debug(`Need to fetch ${totalKeyCount} files`);
  commit('setLoadingMessage', `${logPrefix} (${remainingKeys.length} files remaining)`);
  const generateUrlForId = (id) => `https://joshuacastor.me/bfmt-data/gl/burst/${id}.json?${cacheBustingParam}`;
  const fetchJsonWhileDataRemains = async () => {
    const currentId = remainingKeys.shift();
    if (currentId !== void 0) {
      const data = await getJson(generateUrlForId(currentId));
      pageDb[currentId] = data;

      if ((++countFinished % 100) === 0) {
        logger.debug('finished getting', currentId, remainingKeys.length, 'files remaining');
        commit('setLoadingMessage', `${logPrefix} (${(countFinished / totalKeyCount * 100).toFixed(2)}% complete)`);
      }
      await fetchJsonWhileDataRemains();
    }
  };

  // have no more than 10 concurrent fetches occurring simultaneously
  for (let i = 0; i < 10; ++i) {
    loadPromises.push(fetchJsonWhileDataRemains());
  }

  await Promise.all(loadPromises);
  logger.debug(`finished getting ${Object.keys(pageDb).length} entries`);
  return pageDb;
}

const logger = new Logger({ prefix: '[STORE/BURSTS]' });
const dbWorker = makeMultidexWorker('bursts');
export default {
  namespaced: true,
  state: createState(),
  mutations: createMutations(logger),
  getters: {
    ...createGetters('bursts'),
    sortTypes: () => ['Burst ID', 'Alphabetical', 'Attack Count'],
    filterTypes: () => ['associatedUnits', 'exclusives', 'procs'],
    requiredModules: () => ['bursts', 'units'],
    miniDbFields: () => ['desc', 'id', 'name', 'associated_units', 'attackInfo'],
  },
  actions: {
    ...createActions(dbWorker, downloadWorker, logger, 'bursts'),
    async updateData ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      const baseUrl = `${location.origin}${location.pathname}static/bf-data`;
      const cacheBustingParam = getCacheBustingUrlParam();
      for (const server of servers) {
        const logPrefix = `Downloading data for ${server.toUpperCase()} server`;
        commit('setLoadingMessage', logPrefix);
        const tempLogger = new Logger({ prefix: `[STORE/BURSTS-${server.toUpperCase()}]` });
        try {
          let pageDb = {};
          if (server === 'gl') {
            pageDb = await getDatabaseForGlobal({ logger: tempLogger, commit, logPrefix });
          } else {
            const loadPromises = [];
            let countFinished = 0;
            for (let i = 1; i <= 9; ++i) {
              const url = `${baseUrl}/bbs-${server}-${i}.json?${cacheBustingParam}`;
              loadPromises.push(getJson(url)
                .then(tempData => {
                  Object.keys(tempData)
                    .forEach(id => {
                      pageDb[id] = tempData[id];
                    });
                  tempLogger.debug('finished getting', url, 10 - (++countFinished), 'files remaining');
                  commit('setLoadingMessage', `${logPrefix} (${10 - countFinished} files remaining)`);
                }));
            }

            await Promise.all(loadPromises);
          }
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

