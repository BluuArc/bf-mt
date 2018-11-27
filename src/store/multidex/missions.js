import { Logger } from '@/modules/Logger';
import { makeMultidexWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions, createGetters } from './helper';
import { getCacheBustingUrlParam } from '@/modules/utils';
import {
  exclusiveFilterOptions,
  defaultTernaryOptions,
  missionLocationTypes,
} from '@/modules/constants';
import SWorker from '@/assets/sww.min';

const logger = new Logger({ prefix: '[STORE/MISSIONS]' });
const dbWorker = makeMultidexWorker('missions');
export default {
  namespaced: true,
  state: {
    ...createState(),
    possibleValues: {
      land: [],
      area: [],
      dungeon: [],
    },
  },
  mutations: {
    ...createMutations(logger),
    setPossibleValues (state, values = { land: [], area: [], dungeon: [] }) {
      state.possibleValues = values;
    },
  },
  getters: {
    ...createGetters('missions'),
    sortTypes: () => ['Mission ID', 'Alphabetical', 'Energy', 'Battle Count', 'Map', 'XP', 'XP/EN'],
    filterTypes: () => ['associatedUnits', 'associatedItems', 'gems', 'exclusives', 'continues', 'land', 'area', 'dungeon'],
    requiredModules: () => ['missions', 'units', 'items'],
  },
  actions: {
    ...createActions(dbWorker, downloadWorker, logger, 'missions'),
    async updatePossibleValues ({ commit, state }) {
      commit('setLoadingMessage', 'Getting land, area, and dungeon values for missions');
      const result = await SWorker.run((keys, pageDb, locationTypes) => {
        const possible = { land: [], area: [], dungeon: [] };
        locationTypes.forEach(type => possible[type] = []);
        const addUnique = (arr = [], val = '') => {
          if (!arr.includes(val)) {
            arr.push(val);
          }
        };

        keys.forEach(missionKey => {
          const mission = pageDb[missionKey];
          locationTypes.forEach(locationType => {
            addUnique(possible[locationType], mission[locationType]);
          });
        });
        return possible;
      }, [Object.keys(state.pageDb).sort((a, b) => +a - +b), state.pageDb, missionLocationTypes]);
      commit('setPossibleValues', result);
    },
    async ensurePageDbSyncWithServer ({ commit, dispatch, state }) {
      if (state.pageDb[state.activeServerSymbol] !== state.activeServer) {
        commit('setLoadState', { loadState: true, message: 'Getting data for active server' });
        const data = await dispatch('getMiniDb', state.activeServer);
        commit('setActiveServer', { server: state.activeServer, data });
        await dispatch('updatePossibleValues');
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
        const tempLogger = new Logger({ prefix: `[STORE/MISSIONS-${server.toUpperCase()}]` });
        try {
          const pageDb = await downloadWorker.postMessage('getJson', [`${baseUrl}/missions-${server}.json?${cacheBustingParam}`]);
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
        keys = await dispatch('filterServerExclusiveKeys', { filter: exclusives, keys });
      }

      const ternaryHelper = {
        associatedUnits: defaultTernaryOptions.values,
        associatedItems: defaultTernaryOptions.values,
        gems: defaultTernaryOptions.values,
        continues: defaultTernaryOptions.values,
      };

      const result = await SWorker.run((keys, filters, pageDb, ternaryHelper) => {
        const {
          name = '',
          associatedUnits = '',
          associatedItems = '',
          gems = '',
          continues = '',
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
          const fitsID = (!name ? true : names.filter(n => key.toString().toLowerCase().includes(n) || (entry.id || '').toString().includes(n)).length > 0);

          const hasAssociatedUnits = Array.isArray(entry.clear_bonus) && entry.clear_bonus.filter(bonus => !!bonus.unit).length > 0;
          const fitsAssociatedUnits = fitsTernary(hasAssociatedUnits, associatedUnits, ternaryHelper.associatedUnits);

          const hasAssociatedItems = Array.isArray(entry.clear_bonus) && entry.clear_bonus.filter(bonus => !!bonus.item).length > 0;
          const fitsAssociatedItems = fitsTernary(hasAssociatedItems, associatedItems, ternaryHelper.associatedItems);

          const hasGems = Array.isArray(entry.clear_bonus) && entry.clear_bonus.filter(bonus => !!bonus.gem).length > 0;
          const fitsGemFilter = fitsTernary(hasGems, gems, ternaryHelper.gems);

          const hasContinues = !!entry.continue;
          const fitsContinueFilter = fitsTernary(hasContinues, continues, ternaryHelper.continues);

          const fitsLocationFilters = ['land', 'area', 'dungeon'].map(locationType => {
            const locationFilters = filters[locationType] || [];
            return locationFilters.length === 0 || locationFilters.includes(entry[locationType]);
          }).reduce((acc, val) => acc && val, true);

          return [fitsName || fitsID, fitsAssociatedUnits, fitsAssociatedItems, fitsGemFilter, fitsLocationFilters, fitsContinueFilter].every(val => val);
        });
      }, [keys, inputFilters, state.pageDb, ternaryHelper]);
      return result;
    },
    async getSortedKeys ({ state }, { type, isAscending, keys }) {
      logger.debug('sorts', { type, isAscending, keys });
      const result = await SWorker.run((keys, type, isAscending, pageDb, possibleValues) => {
        const compareHelper = {
          getIdCompareResult ({ idA, idB }) {
            return +idA - +idB;
          },
          getStringCompareResult ({ strA, strB }, ids) {
            if (strA === strB) {
              return this.getIdCompareResult(ids);
            }
            return (strA > strB) ? 1 : -1;
          },
          getNumberCompareResult ({ numA, numB }, ids) {
            if (numA === numB) {
              return this.getIdCompareResult(ids);
            }
            return numA - numB;
          },
          calculateXpPerEnergy (xp = 0, en = 0) {
            return xp / (Math.max(1, en));
          },
        };
        const sortTypes = {
          'Mission ID': (idA, idB, isAscending) => {
            const result = (+idA - +idB);
            return isAscending ? result : -result;
          },
          Alphabetical: (idA, idB, isAscending) => {
            const [nameA, nameB] = [pageDb[idA].name, pageDb[idB].name];
            const result = (nameA > nameB) ? 1 : -1;
            return isAscending ? result : -result;
          },
          Energy: (idA, idB, isAscending) => {
            const [numA, numB] = [+pageDb[idA].energy_use, +pageDb[idB].energy_use];
            const result = compareHelper.getNumberCompareResult({ numA, numB }, { idA, idB });
            return isAscending ? result : -result;
          },
          'Battle Count': (idA, idB, isAscending) => {
            const [numA, numB] = [+pageDb[idA].battle_count, +pageDb[idB].battle_count];
            const result = compareHelper.getNumberCompareResult({ numA, numB }, { idA, idB });
            return isAscending ? result : -result;
          },
          Map: (idA, idB, isAscending) => {
            const [missionA, missionB] = [pageDb[idA], pageDb[idB]];
            const { land: landA, area: areaA, dungeon: dungeonA } = missionA;
            const { land: landB, area: areaB, dungeon: dungeonB } = missionB;
            let numA, numB;
            // missions are categorized as land/area/dungeon/name
            if (landA === landB) {
              if (areaA === areaB) {
                [numA, numB] = [possibleValues.dungeon.indexOf(dungeonA), possibleValues.dungeon.indexOf(dungeonB)];
              } else {
                [numA, numB] = [possibleValues.area.indexOf(areaA), possibleValues.area.indexOf(areaB)];
              }
            } else {
              [numA, numB] = [possibleValues.land.indexOf(landA), possibleValues.land.indexOf(landB)];
            }
            const result = compareHelper.getNumberCompareResult({ numA, numB }, { idA, idB });
            return isAscending ? result : -result;
          },
          XP: (idA, idB, isAscending) => {
            const [numA, numB] = [+pageDb[idA].xp, pageDb[idB].xp];
            const result = compareHelper.getNumberCompareResult({ numA, numB }, { idA, idB });
            return isAscending ? result : -result;
          },
          'XP/EN': (idA, idB, isAscending) => {
            const [xpA, xpB] = [+pageDb[idA].xp, pageDb[idB].xp];
            const [energyA, energyB] = [+pageDb[idA].energy_use, +pageDb[idB].energy_use];
            const [numA, numB] = [compareHelper.calculateXpPerEnergy(xpA, energyA), compareHelper.calculateXpPerEnergy(xpB, energyB)];
            const result = compareHelper.getNumberCompareResult({ numA, numB }, { idA, idB });
            return isAscending ? result : -result;
          },
        };

        return keys.slice().sort((a, b) => sortTypes[type](a, b, isAscending));
      }, [keys, type, isAscending, state.pageDb, state.possibleValues]);
      return result;
    },
  },
};

