import { Logger } from '@/modules/Logger';
import { makeMultidexWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions, createGetters } from './helper';
import { getCacheBustingUrlParam } from '@/modules/utils';
import { exclusiveFilterOptions } from '@/modules/constants';
import SWorker from '@/assets/sww.min';
// import union from 'lodash/union';

const logger = new Logger({ prefix: '[STORE/DICTIONARY]' });
const dbWorker = makeMultidexWorker('dictionary');
export default {
  namespaced: true,
  state: createState(),
  mutations: createMutations(logger),
  getters: {
    ...createGetters('dictionary'),
    sortTypes: () => ['Dictionary ID', 'Alphabetical'],
    // filterTypes: () => ['associatedUnits', 'associatedItems', 'exclusives'],
    filterTypes: () => [],
    requiredModules: () => ['dictionary'/*, 'units', 'items'*/],
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
          const fitsID = (!name ? true : names.filter(n => key.toString().includes(n)).length > 0);

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

