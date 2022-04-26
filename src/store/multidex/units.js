import { Logger } from '@/modules/Logger';
import { makeMultidexWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker'; // TODO: remove
import { createState, createMutations, createActions, createGetters } from './helper';
import { getCacheBustingUrlParam } from '@/modules/utils';
import { CONTENT_URLS } from '@/modules/constants';
import { getJson } from '@/modules/download-helper';

const logger = new Logger({ prefix: '[STORE/UNITS]' });
const dbWorker = makeMultidexWorker('units');

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
  let countFinished = 0;
  for (let i = 1; i <= 6; ++i) {
    const url = `https://joshuacastor.me/bfmt-data/gl/unit/bfmt_all-entries-${i}.json?${cacheBustingParam}`;
    loadPromises.push(getJson(url)
      .then(tempData => {
        Object.assign(pageDb, tempData);
        if (tempData[1]) {
          delete pageDb[1];
        }
        logger.debug('finished getting', url, 6 - (++countFinished), 'files remaining');
        commit('setLoadingMessage', `${logPrefix} (${6 - countFinished} files remaining)`);
      }));
  }


  await Promise.all(loadPromises);
  return pageDb;
}

export default {
  namespaced: true,
  state: createState(),
  mutations: createMutations(logger),
  getters: {
    ...createGetters('units'),
    getImageUrls: state => id => {
      const baseUrl = `${CONTENT_URLS[state.activeServer]}/unit/img`;

      return {
        ills_full: `${baseUrl}/unit_ills_full_${id}.png`,
        ills_thum: `${baseUrl}/unit_ills_thum_${id}.png`,
        anime: `${baseUrl}/unit_thum_${id}.png`,
        ills_battle: `${baseUrl}/unit_ills_battle_${id}.png`,
      };
    },
    sortTypes: () => ['Unit ID', 'Guide ID', 'Alphabetical', 'Rarity', 'Element', 'Normal Attack Hit Count', 'Attack Count on BB', 'Attack Count on SBB', 'Attack Count on UBB'],
    filterTypes: () => ['elements', 'rarity', 'unitKinds', 'genders', 'exclusives', 'procs', 'passives'],
    requiredModules: () => ['units', 'items', 'missions'],
    miniDbFields: () => ['cost', 'element', 'gender', 'guide_id', 'id', 'name', 'rarity', 'next', 'prev', 'evo_mats', 'kind', 'evo_cost', 'attackInfo'],
  },
  actions: {
    ...createActions(dbWorker, downloadWorker, logger, 'units'),
    async updateData ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      const baseUrl = `${location.origin}${location.pathname}static/bf-data`;
      const cacheBustingParam = getCacheBustingUrlParam();
      for (const server of servers) {
        const logPrefix = `Downloading data for ${server.toUpperCase()} server`;
        commit('setLoadingMessage', logPrefix);
        const tempLogger = new Logger({ prefix: `[STORE/UNITS-${server.toUpperCase()}]` });
        try {
          let pageDb = {};
          if (server === 'gl') {
            pageDb = await getDatabaseForGlobal({ logger: tempLogger, commit, logPrefix });
          } else {
            const loadPromises = [];
            let countFinished = 0;
            for (let i = 1; i <= 6; ++i) {
              const url = `${baseUrl}/units-${server}-${i}.json?${cacheBustingParam}`;
              loadPromises.push(getJson(url)
                .then(tempData => {
                  Object.keys(tempData)
                    .forEach(id => {
                      if (+id !== 1) {
                        pageDb[id] = tempData[id];
                      }
                    });
                  tempLogger.debug('finished getting', url, 6 - (++countFinished), 'files remaining');
                  commit('setLoadingMessage', `${logPrefix} (${6 - countFinished} files remaining)`);
                }));
            }

            await Promise.all(loadPromises);
            const dictionaryData = await getJson(`${baseUrl}/unit-dictionary-${server}.json?${cacheBustingParam}`);
            Object.keys(dictionaryData).forEach(id => {
              if (pageDb[id]) {
                pageDb[id].dictionary = dictionaryData[id];
              }
            });

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

