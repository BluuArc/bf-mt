import { Logger } from '@/modules/Logger';
import { makeMultidexWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions, createGetters } from './helper';
import { getCacheBustingUrlParam } from '@/modules/utils';
import {
  exclusiveFilterOptions,
  defaultTernaryOptions
} from '@/modules/constants';
import SWorker from '@/assets/sww.min';

const logger = new Logger({ prefix: '[STORE/LEADER-SKILLS]' });
const dbWorker = makeMultidexWorker('leaderSkills');
export default {
  namespaced: true,
  state: createState(),
  mutations: createMutations(logger),
  getters: {
    ...createGetters('leader-skills'),
    sortTypes: () => ['Skill ID', 'Alphabetical'],
    filterTypes: () => ['associatedUnits', 'exclusives', 'procs', 'passives'],
    requiredModules: () => ['leaderSkills', 'units'],
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
    async getFilteredKeys ({ state, dispatch }, inputFilters = {}) {
      logger.debug('filters', inputFilters);
      let keys = Object.keys(state.pageDb);

      const {
        exclusives = exclusiveFilterOptions.allValue,
        procs = [],
        procBuffSearchOptions = [],
        passives = [],
        passiveBuffSearchOptions = [],
      } = inputFilters;
      if (!exclusiveFilterOptions.isAll(exclusives)) {
        keys = await dispatch('filterServerExclusiveKeys', { filter: exclusives, keys })
      }

      const ternaryHelper = {
        associatedUnits: defaultTernaryOptions.values,
      };

      const result = await SWorker.run((keys, filters, pageDb, ternaryHelper) => {
        const {
          name = '',
          associatedUnits = '',
        } = filters;
        // trim off the spaces of subsequent names
        const names = (name || '').split('|').filter((v, i) => i === 0 || v.trim()).map(n => n.toLowerCase());

        const fitsTernary = (entryIsTrue = false, filterValue = '', { all, truthy, falsy }) => {
          return filterValue === all ||
          (filterValue === truthy && entryIsTrue) ||
          (filterValue === falsy && !entryIsTrue);
        };

        return keys.filter(key => {
          const entry = pageDb[key];
          const fitsName = (!name ? true : names.filter(n => entry.name.toLowerCase().includes(n)).length > 0);
          const fitsID = (!name ? true : names.filter(n => key.toString().includes(n) || (entry.id || '').toString().includes(n)).length > 0);

          const hasAssociatedUnits = Array.isArray(entry.associated_units) && entry.associated_units.length > 0;
          const fitsAssociatedUnits = fitsTernary(hasAssociatedUnits, associatedUnits, ternaryHelper.associatedUnits);

          return [fitsName || fitsID, fitsAssociatedUnits].every(val => val);
        });
      }, [keys, inputFilters, state.pageDb, ternaryHelper]);

      if (procs.length > 0 || passives.length > 0) {
        const filteredKeys = await dispatch('filterProcsAndPassives', {
          procs,
          procAreas: procBuffSearchOptions,
          passives,
          passiveAreas: passiveBuffSearchOptions,
          keys: result,
        });
        return filteredKeys;
      } else {
        return result;
      }
    },
    async getSortedKeys ({ state }, { type, isAscending, keys }) {
      logger.debug('sorts', { type, isAscending, keys });
      const result = await SWorker.run((keys, type, isAscending, pageDb) => {
        const sortTypes = {
          'Skill ID': (idA, idB, isAscending) => {
            const result = (+idA - +idB);
            return isAscending ? result : -result;
          },
          Alphabetical: (idA, idB, isAscending) => {
            const [nameA, nameB] = [pageDb[idA].name, pageDb[idB].name];
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

