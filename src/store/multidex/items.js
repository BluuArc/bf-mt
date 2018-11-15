import { Logger } from '@/modules/Logger';
import { makeMultidexWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions, createGetters } from './helper';
import { getCacheBustingUrlParam } from '@/modules/utils';
import {
  exclusiveFilterOptions,
  sphereTypeMapping,
  defaultTernaryOptions,
  craftableFilterOptions,
  usageFilterOptions,
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
        craftables: craftableFilterOptions.values,
        usage: usageFilterOptions.values,
      };

      const result = await SWorker.run((keys, filters, pageDb, ternaryHelper) => {
        const {
          name = '',
          rarity = [],
          itemTypes = [],
          sphereTypes = [],
          associatedUnits = '',
          craftables = '',
          usage = '',
        } = filters;
        // trim off the spaces of subsequent names
        const names = (name || '').split('|').filter((v, i) => i === 0 || v.trim()).map(n => n.toLowerCase());
        const includeNoneSphereType = sphereTypes.includes(0);
        const includeAnySphereType = sphereTypes.length === 15;

        const fitsTernary = (entryIsTrue = false, filterValue = '', { all, truthy, falsy }) => {
          return filterValue === all ||
          (filterValue === truthy && entryIsTrue) ||
          (filterValue === falsy && !entryIsTrue);
        };

        return keys.filter(key => {
          const entry = pageDb[key];
          const fitsName = (!name ? true : names.filter(n => entry.name.toLowerCase().includes(n)).length > 0);
          const fitsID = (!name ? true : names.filter(n => key.toString().toLowerCase().includes(n) || (entry.id || '').toString().includes(n)).length > 0);
          const fitsRarity = rarity.includes(entry.rarity);
          const fitsItemType = itemTypes.includes(entry.type) || (itemTypes.includes('raid') && entry.raid);

          const hasSphereType = entry['sphere type'] !== undefined || entry.type === 'sphere' || entry.type === 'ls_sphere';
          const fitsSphereType = includeAnySphereType ||
            (hasSphereType && (sphereTypes.includes(entry['sphere type']))) ||
            (includeNoneSphereType && !entry['sphere type']);

          const hasAssociatedUnits = Array.isArray(entry.associated_units) && entry.associated_units.length > 0;
          const fitsAssociatedUnits = fitsTernary(hasAssociatedUnits, associatedUnits, ternaryHelper.associatedUnits);

          const isCraftable = !!entry.recipe;
          const fitsCraftable = fitsTernary(isCraftable, craftables, ternaryHelper.craftables);

          const isUsed = !!entry.usage && entry.usage.length > 0;
          const fitsUsage = fitsTernary(isUsed, usage, ternaryHelper.usage);

          return [fitsName || fitsID, fitsItemType, fitsRarity, fitsSphereType, fitsAssociatedUnits, fitsCraftable, fitsUsage].every(val => val);
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

