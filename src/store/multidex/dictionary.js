import { Logger } from '@/modules/Logger';
import { makeMultidexWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions, createGetters } from './helper';
import { getCacheBustingUrlParam } from '@/modules/utils';
import { exclusiveFilterOptions } from '@/modules/constants';
import SWorker from '@/assets/sww.min';

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
    requiredModules: () => ['dictionary', 'units', 'items'],
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
        logger.warn('resetting assocations');
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
    async getFilteredKeys ({ state, dispatch }, inputFilters = {}) {
      logger.debug('filters', inputFilters);
      let keys = Object.keys(state.pageDb);

      const {
        exclusives = exclusiveFilterOptions.allValue,
      } = inputFilters;
      if (!exclusiveFilterOptions.isAll(exclusives)) {
        keys = await dispatch('filterServerExclusiveKeys', { filter: exclusives, keys })
      }

      // const ternaryHelper = {
      //   associatedUnits: defaultTernaryOptions.values,
      // };

      const result = await SWorker.run((keys, filters, pageDb/*, ternaryHelper*/) => {
        const {
          name = '',
          // associatedUnits = '',
        } = filters;
        // trim off the spaces of subsequent names
        const names = (name || '').split('|').filter((v, i) => i === 0 || v.trim()).map(n => n.toLowerCase());

        // const fitsTernary = (entryIsTrue = false, filterValue = '', { all, truthy, falsy }) => {
        //   return filterValue === all ||
        //   (filterValue === truthy && entryIsTrue) ||
        //   (filterValue === falsy && !entryIsTrue);
        // };

        return keys.filter(key => {
          const entry = pageDb[key];
          const fitsDescription = (!name ? true : names.filter(n => entry.toLowerCase().includes(n)).length > 0);
          const fitsID = (!name ? true : names.filter(n => key.toString().toLowerCase().includes(n)).length > 0);

          // const hasAssociatedUnits = Array.isArray(entry.associated_units) && entry.associated_units.length > 0;
          // const fitsAssociatedUnits = fitsTernary(hasAssociatedUnits, associatedUnits, ternaryHelper.associatedUnits);

          return [fitsDescription || fitsID/* , fitsAssociatedUnits*/].every(val => val);
        });
      }, [keys, inputFilters, state.pageDb/*, ternaryHelper*/]);

      return result;
    },
    async getSortedKeys ({ state }, { type, isAscending, keys }) {
      logger.debug('sorts', { type, isAscending, keys });
      const result = await SWorker.run((keys, type, isAscending, pageDb) => {
        const sortTypes = {
          'Dictionary ID': (idA, idB, isAscending) => {
            const result = (idA > idB) ? 1 : -1;
            return isAscending ? result : -result;
          },
          Alphabetical: (idA, idB, isAscending) => {
            const [nameA, nameB] = [pageDb[idA], pageDb[idB]];
            const result = (nameA > nameB) ? 1 : -1;
            return isAscending ? result : -result;
          },
        };

        return keys.slice().sort((a, b) => sortTypes[type](a, b, isAscending));
      }, [keys, type, isAscending, state.pageDb]);
      return result;
    },
  },
};

