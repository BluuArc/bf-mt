import { Logger } from '@/modules/Logger';
import { makeMultidexWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions, createGetters } from './helper';
import SWorker from '@/assets/sww.min';
import {
  elements,
  exclusiveFilterOptions,
} from '@/modules/constants';
import { getCacheBustingUrlParam } from '@/modules/utils';

const logger = new Logger({ prefix: '[STORE/UNITS]' });
const dbWorker = makeMultidexWorker('units');
export default {
  namespaced: true,
  state: createState(),
  mutations: createMutations(logger),
  getters: {
    ...createGetters('units'),
    getImageUrls: state => id => {
      const cdnUrls = {
        eu: 'http://static-bravefrontier.gumi-europe.net/content',
        gl: 'http://dlc.bfglobal.gumi.sg/content',
        jp: 'http://cdn.android.brave.a-lim.jp',
      };

      const baseUrl = `${cdnUrls[state.activeServer]}/unit/img`;

      return {
        ills_full: `${baseUrl}/unit_ills_full_${id}.png`,
        ills_thum: `${baseUrl}/unit_ills_thum_${id}.png`,
        anime: `${baseUrl}/unit_thum_${id}.png`,
        ills_battle: `${baseUrl}/unit_ills_battle_${id}.png`,
      };
    },
    sortTypes: () => ['Unit ID', 'Guide ID', 'Alphabetical', 'Rarity', 'Element'],
    filterTypes: () => ['elements', 'rarity', 'unitKinds', 'genders', 'exclusives', 'procs', 'passives'],
    requiredModules: () => ['units', 'items', 'missions'],
    miniDbFields: () => ['cost', 'element', 'gender', 'guide_id', 'id', 'name', 'rarity', 'next', 'prev', 'evo_mats', 'kind', 'evo_cost'],
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
          const pageDb = {};
          const loadPromises = [];
          let countFinished = 0;
          for (let i = 1; i <= 6; ++i) {
            const url = `${baseUrl}/units-${server}-${i}.json?${cacheBustingParam}`;
            loadPromises.push(downloadWorker
              .postMessage('getJson', [url])
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
          const dictionaryData = await downloadWorker.postMessage('getJson', [`${baseUrl}/unit-dictionary-${server}.json?${cacheBustingParam}`]);
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
      const result = await SWorker.run((keys, type, isAscending, pageDb, elements) => {
        const sortTypes = {
          'Unit ID': (idA, idB, isAscending) => {
            const result = (+idA - +idB);
            return isAscending ? result : -result;
          },
          'Guide ID': (idA, idB, isAscending) => {
            const result = +pageDb[idA].guide_id - +pageDb[idB].guide_id;
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
          Element: (idA, idB, isAscending) => {
            const [elementA, elementB] = [pageDb[idA].element, pageDb[idB].element];
            const indexA = elements.indexOf(elementA);
            const indexB = elements.indexOf(elementB);
            const result = indexA === indexB ? (+idA - +idB) : (indexA - indexB);
            return isAscending ? result : -result;
          },
        };

        return keys.slice().sort((a, b) => sortTypes[type](a, b, isAscending));
      }, [keys, type, isAscending, state.pageDb, elements]);
      return result;
    },
  },
};

