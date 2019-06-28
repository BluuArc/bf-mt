import { Logger } from '@/modules/Logger';
import { makeMultidexWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions, createGetters } from './helper';
import { getCacheBustingUrlParam } from '@/modules/utils';
import {
  sphereTypeMapping,
  CONTENT_URLS,
} from '@/modules/constants';

const logger = new Logger({ prefix: '[STORE/ITEMS]' });
const dbWorker = makeMultidexWorker('items');
export default {
  namespaced: true,
  state: createState(),
  mutations: createMutations(logger),
  getters: {
    ...createGetters('items'),
    getImageUrl: state => (id, fullEntry) => {
      const baseUrl = `${CONTENT_URLS[state.activeServer]}/item`;
      if (fullEntry && fullEntry.thumbnail) {
        return `${baseUrl}/${fullEntry.thumbnail}`;
      } else if (state.pageDb.hasOwnProperty(id)) {
        return `${baseUrl}/${state.pageDb[id].thumbnail}`;
      } else {
        return baseUrl;
      }
    },
    getSphereCategory: () => num => {
      return sphereTypeMapping[+num];
    },
    sortTypes: () => ['Item ID', 'Alphabetical', 'Rarity', 'Type', 'Sell Price'],
    filterTypes: () => ['rarity', 'itemTypes', 'sphereTypes', 'associatedUnits', 'craftables', 'usage', 'exclusives', 'procs', 'passives'],
    requiredModules: () => ['items', 'units', 'missions'],
    miniDbFields: () => ['desc', 'id', 'name', 'rarity', 'thumbnail', 'type', 'raid', 'max_stack', 'sell_price', 'recipe', 'usage', 'associated_units', 'sphere type'],
  },
  actions: {
    ...createActions(dbWorker, downloadWorker, logger, 'items'),
    async updateData ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      const baseUrl = `${location.origin}${location.pathname}static/bf-data`;
      const cacheBustingParam = getCacheBustingUrlParam();
      for (const server of servers) {
        const logPrefix = `Downloading data for ${server.toUpperCase()} server`;
        commit('setLoadingMessage', logPrefix);
        const tempLogger = new Logger({ prefix: `[STORE/ITEMS-${server.toUpperCase()}]` });
        try {
          const pageDb = {};
          const loadPromises = [];
          let countFinished = 0;
          for (let i = 1; i <= 9; ++i) {
            const url = `${baseUrl}/items-${server}-${i}.json?${cacheBustingParam}`;
            loadPromises.push(downloadWorker
              .postMessage('getJson', [url])
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
          const dictionaryData = await downloadWorker.postMessage('getJson', [`${baseUrl}/item-dictionary-${server}.json?${cacheBustingParam}`]);
          Object.keys(dictionaryData).forEach(id => {
            if (pageDb[id]) {
              pageDb[id].dictionary = dictionaryData[id];
            }
          });
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

