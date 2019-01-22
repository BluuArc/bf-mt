import { Logger } from '@/modules/Logger';
import { makeMultidexWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions, createGetters } from './helper';
import { getCacheBustingUrlParam } from '@/modules/utils';
import {
  exclusiveFilterOptions,
  sphereTypeMapping,
} from '@/modules/constants';
import FilterOptionsHelper from '@/modules/FilterOptionsHelper';
import SWorker from '@/assets/sww.min';

const logger = new Logger({ prefix: '[STORE/ITEMS]' });
const dbWorker = makeMultidexWorker('items');
const filterHelper = new FilterOptionsHelper();
export default {
  namespaced: true,
  state: createState(),
  mutations: createMutations(logger),
  getters: {
    ...createGetters('items'),
    getImageUrl: state => id => {
      const cdnUrls = {
        eu: 'http://static-bravefrontier.gumi-europe.net/content',
        gl: 'http://dlc.bfglobal.gumi.sg/content',
        jp: 'http://cdn.android.brave.a-lim.jp',
      };
      const baseUrl = `${cdnUrls[state.activeServer]}/item`;
      if (state.pageDb.hasOwnProperty(id)) {
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
    async getFilteredKeys ({ state, dispatch }, inputFilters = {}) {
      logger.debug('filters', inputFilters);
      let keys; // leave blank, as it should default to full DB in worker

      const {
        exclusives = exclusiveFilterOptions.allValue,
      } = inputFilters;
      if (!exclusiveFilterOptions.isAll(exclusives)) {
        keys = await dispatch('filterServerExclusiveKeys', { filter: exclusives, keys });
      }

      return dbWorker.getFilteredKeys(state.activeServer, { keys, ...inputFilters });
    },
    async getSortedKeys ({ state }, { type, isAscending, keys }) {
      logger.debug('sorts', { type, isAscending, keys });
      const result = await SWorker.run((keys, type, isAscending, pageDb, defaultFilters) => {
        const sortTypes = {
          'Item ID': (idA, idB, isAscending) => {
            const result = (+idA - +idB);
            return isAscending ? result : -result;
          },
          Alphabetical: (idA, idB, isAscending) => {
            const [nameA, nameB] = [pageDb[idA].name, pageDb[idB].name];
            const result = (nameA > nameB) ? 1 : -1;
            return isAscending ? result : -result;
          },
          Rarity: (idA, idB, isAscending) => {
            const [rarityA, rarityB] = [+pageDb[idA].rarity, +pageDb[idB].rarity];
            const result = rarityA === rarityB ? (+idA - +idB) : (rarityA - rarityB);
            return isAscending ? result : -result;
          },
          Type: (idA, idB, isAscending) => {
            const [typeA, typeB] = [pageDb[idA].type, pageDb[idB].type];
            const getIndex = (type) => defaultFilters.itemTypes.indexOf(type);
            const result = typeA === typeB ? (+idA - +idB) : (getIndex(typeA) - getIndex(typeB));
            return isAscending ? result : -result;
          },
          'Sell Price': (idA, idB, isAscending) => {
            const [priceA, priceB] = [+pageDb[idA].sell_price, +pageDb[idB].sell_price];
            const result = priceA === priceB ? (+idA - +idB) : (priceA - priceB);
            return isAscending ? result : -result;
          },
        };

        return keys.slice().sort((a, b) => sortTypes[type](a, b, isAscending));
      }, [keys, type, isAscending, state.pageDb, filterHelper.defaultValues]);
      return result;
    },
  },
};

