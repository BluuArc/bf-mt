import { Logger } from '@/modules/Logger';
import { makeMultidexWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions, createGetters } from './helper';
import SWorker from '@/assets/sww.min';
import {
  servers,
  elements,
  exclusiveFilterOptions,
} from '@/modules/constants';
// import union from 'lodash/union';

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
  },
  actions: {
    ...createActions(dbWorker, downloadWorker, logger, 'units'),
    async updateData ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      const baseUrl = `${location.origin}${location.pathname}static/bf-data`;
      for (const server of servers) {
        const logPrefix = `Downloading data for ${server.toUpperCase()} server`;
        commit('setLoadingMessage', logPrefix);
        const tempLogger = new Logger({ prefix: `[STORE/UNITS-${server.toUpperCase()}]` });
        try {
          const pageDb = {};
          const loadPromises = [];
          let countFinished = 0;
          for (let i = 1; i <= 6; ++i) {
            const url = `${baseUrl}/units-${server}-${i}.json`;
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
    async getKeysForServer ({ state, commit }, server = 'gl') {
      if (!state.keyLists[server]) {
        logger.error('unknown server', server);
        return [];
      }
      let keys = state.keyLists[server];
      if (keys.length === 0) {
        logger.debug('no cached key list found for', server, 'Getting new key list');
        keys = await dbWorker.getFieldKeys({ server }, 'data');
        commit('setKeyListForServer', { server, keys });
      }
      return keys;
    },
    async getFilteredKeys ({ state, dispatch }, inputFilters = {}) {
      logger.debug('filters', inputFilters);
      const keys = Object.keys(state.pageDb);

      const { exclusives = exclusiveFilterOptions.allValue } = inputFilters;
      let otherKeys = [];
      if (!exclusiveFilterOptions.isAll(exclusives)) {
        const otherServers = servers.filter(s => s !== state.activeServer);
        const serverKeys = await Promise.all(otherServers.map(s => dispatch('getKeysForServer', s)));
        otherKeys = await SWorker.run((keysA, keysB) => {
          const unionResult = keysA.slice().concat(keysB.filter(b => !keysA.includes(b))).sort((a, b) => +a - +b);
          return unionResult;
        }, [...serverKeys]);
      }

      const ternaries = {
        exclusives: exclusiveFilterOptions.values,
      };

      const result = await SWorker.run((keys, filters, pageDb, otherKeys, ternaries) => {
        const {
          name = '',
          elements = [],
          rarity = [],
          unitKinds = [],
          genders = [],
          exclusives = ternaries.exclusives.all,
        } = filters;
        return keys.filter(key => {
          const entry = pageDb[key];
          const fitsName = (!name ? true : entry.name.toLowerCase().includes(name.toLowerCase()));
          const fitsID = (!name ? true : key.toString().includes(name) || (entry.id || '').toString().includes(name));
          const fitsElement = elements.includes(entry.element);
          const fitsRarity = rarity.includes(entry.rarity);
          const fitsGender = genders.includes(entry.gender);

          // need to flip evo/enhancing as they're marked wrong in the data at time of writing
          // default to enhancing so that Omni Frog and Omni Emperor aren't hidden by default
          const kindEntry = (entry.kind === 'evo' ? 'enhancing' : entry.kind === 'enhancing' ? 'evolution' : entry.kind) || 'enhancing';
          const fitsKind = unitKinds.includes(kindEntry);


          const isExclusive = !otherKeys.includes((entry.id || '').toString());
          const fitsExclusive = (
            exclusives === ternaries.exclusives.all ||
            (exclusives === ternaries.exclusives.truthy && isExclusive) ||
            (exclusives === ternaries.exclusives.falsy && !isExclusive));
          return [fitsName || fitsID, fitsElement, fitsRarity, fitsKind, fitsGender, fitsExclusive].every(val => val);
        });
      }, [keys, inputFilters, state.pageDb, otherKeys, ternaries]);
      return result;
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

