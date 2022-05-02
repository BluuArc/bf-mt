import { Logger } from '@/modules/Logger';
import { makeMultidexWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions, createGetters } from './helper';
import { getCacheBustingUrlParam } from '@/modules/utils';
import SWorker from '@/assets/sww.min';
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

  const fullList = await getJson(`https://joshuacastor.me/bfmt-data/gl/dictionary/bfmt_update-stats.json?${cacheBustingParam}`);
  const remainingKeys = Object.keys(fullList);
  const totalKeyCount = remainingKeys.length;
  let countFinished = 0;
  logger.debug(`Need to fetch ${totalKeyCount} files`);
  commit('setLoadingMessage', `${logPrefix} (${remainingKeys.length} files remaining)`);
  const generateUrlForId = (id) => `https://joshuacastor.me/bfmt-data/gl/dictionary/${id}.json?${cacheBustingParam}`;
  const fetchJsonWhileDataRemains = async () => {
    const currentId = remainingKeys.shift();
    if (currentId !== void 0) {
      const data = await getJson(generateUrlForId(currentId));
      Object.assign(pageDb, data.entries);

      if ((++countFinished % 15) === 0) {
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

const logger = new Logger({ prefix: '[STORE/DICTIONARY]' });
const dbWorker = makeMultidexWorker('dictionary');
export default {
  namespaced: true,
  state: {
    ...createState(),
    unitAssociations: {},
    itemAssociations: {},
  },
  mutations: {
    ...createMutations(logger),
    setUnitAssociations (state, values = {}) {
      state.unitAssociations = values;
      logger.debug('unitAssociations', values);
    },
    setItemAssociations (state, values = {}) {
      state.itemAssociations = values;
      logger.debug('itemAssociations', values);
    },
  },
  getters: {
    ...createGetters('dictionary'),
    sortTypes: () => ['Dictionary ID', 'Alphabetical'],
    // filterTypes: () => ['associatedUnits', 'associatedItems', 'exclusives'],
    filterTypes: () => [],
    requiredModules: () => ['dictionary'/*, 'units', 'items'*/],
    miniDbFields: () => ['*'],
  },
  actions: {
    ...createActions(dbWorker, downloadWorker, logger, 'dictionary'),
    async updateAssociations ({ commit, state }, { unitDb = {}, itemDb = {}, setLoadState = false }) {
      if (Object.keys(state.unitAssociations).length === 0) {
        if (setLoadState) {
          commit('setLoadState', true);
        }
        commit('setLoadingMessage', 'Getting unit associations');
        const unitAssociations = await SWorker.run((dictionary, unitKeys) => {
          const result = {};
          const keyPrefix = `MST_UNITCOMMENT`;
          const fields = ['summon', 'fusion', 'evolution', 'description'];
          // check if there's a dictionary entry for every unit id
          unitKeys.forEach(id => {
            const entry = {};
            let hasEntry = false;
            fields.forEach(field => {
              const dictKey = [keyPrefix, id.toString(), field.toUpperCase()].join('_');
              if (dictionary[dictKey]) {
                entry[field] = dictionary[dictKey];
                hasEntry = true;
              }
            });
            if (hasEntry) {
              result[id.toString()] = entry;
            }
          });
          return result;
        }, [state.pageDb, Object.keys(unitDb)]);
        commit('setUnitAssociations', unitAssociations);
        if (setLoadState) {
          commit('setLoadState', false);
        }
      }

      if (Object.keys(state.itemAssociations).length === 0) {
        if (setLoadState) {
          commit('setLoadState', true);
        }
        commit('setLoadingMessage', 'Getting item associations');
        const itemAssociations = await SWorker.run((dictionary, itemKeys) => {
          const result = {};
          const possibleFields = ['ITEMS_BATTLEITEMS', 'ITEMS_MATERIAL', 'LSSPHERE', 'SPHERES'];
          const generateDictKey = (id, fieldType) => ['MST', fieldType, id, 'LONGDESCRIPTION'].join('_');
          // check if there's a dictionary entry for every item id
          itemKeys.forEach(id => {
            const dictEntry = possibleFields.reduce((acc, type) => acc || dictionary[generateDictKey(id, type)], undefined);
            if (dictEntry) {
              result[id.toString()] = {
                lore: dictEntry,
              };
            }
          });
          return result;
        }, [state.pageDb, Object.keys(itemDb)]);
        commit('setItemAssociations', itemAssociations);
        if (setLoadState) {
          commit('setLoadState', false);
        }
      }
    },
    async ensurePageDbSyncWithServer ({ commit, dispatch, state }) {
      if (state.pageDb[state.activeServerSymbol] !== state.activeServer) {
        commit('setLoadState', { loadState: true, message: 'Getting data for active server' });
        const data = await dispatch('getMiniDb', state.activeServer);
        commit('setActiveServer', { server: state.activeServer, data });

        // reset unit and item associations
        commit('setUnitAssociations', {});
        commit('setItemAssociations', {});
        
        commit('setLoadState', false);
      }
    },
    async updateData ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      const baseUrl = `${location.origin}${location.pathname}static/bf-data`;
      const cacheBustingParam = getCacheBustingUrlParam();
      for (const server of servers) {
        const logPrefix = `Downloading data for ${server.toUpperCase()} server`;
        commit('setLoadingMessage', logPrefix);
        const tempLogger = new Logger({ prefix: `[STORE/DICTIONARY-${server.toUpperCase()}]` });
        try {
          let pageDb = {};
          if (server === 'gl') {
            pageDb = await getDatabaseForGlobal({ logger: tempLogger, commit, logPrefix });
          } else {
            const loadPromises = [];
            let countFinished = 0;
            for (let i = 0; i <= 9; ++i) {
              const url = `${baseUrl}/dictionary-${server}-${i}.json?${cacheBustingParam}`;
              loadPromises.push(getJson(url)
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
          }
          tempLogger.debug('result key length', Object.keys(pageDb).length);
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

