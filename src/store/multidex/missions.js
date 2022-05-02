import { Logger } from '@/modules/Logger';
import { makeMultidexWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions, createGetters } from './helper';
import { getCacheBustingUrlParam } from '@/modules/utils';
import {
  CONTENT_URLS,
  exclusiveFilterOptions,
  missionLocationTypes,
} from '@/modules/constants';
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

  const fullList = await getJson(`https://joshuacastor.me/bfmt-data/gl/mission/bfmt_update-stats.json?${cacheBustingParam}`);
  const remainingKeys = Object.keys(fullList);
  const totalKeyCount = remainingKeys.length;
  let countFinished = 0;
  logger.debug(`Need to fetch ${totalKeyCount} files`);
  commit('setLoadingMessage', `${logPrefix} (${remainingKeys.length} files remaining)`);
  const generateUrlForId = (id) => `https://joshuacastor.me/bfmt-data/gl/mission/${id}.json?${cacheBustingParam}`;
  const fetchJsonWhileDataRemains = async () => {
    const currentId = remainingKeys.shift();
    if (currentId !== void 0) {
      const data = await getJson(generateUrlForId(currentId));
      pageDb[currentId] = data;

      if ((++countFinished % 100) === 0) {
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
    getBackgroundUrl: state => (fileName) => `${CONTENT_URLS[state.activeServer]}/dungeon/${fileName}`,
    getAudioUrl: state => (fileName) => `${CONTENT_URLS[state.activeServer]}/sound/${fileName}`,
    getCommonCutsceneUrl: state => (fileName) => `${CONTENT_URLS[state.activeServer]}/event/${fileName}`,
    sortTypes: () => ['Mission ID', 'Alphabetical', 'Energy', 'Battle Count', 'Map', 'XP', 'XP/EN'],
    filterTypes: () => ['associatedUnits', 'associatedItems', 'gems', 'exclusives', 'continues', 'land', 'area', 'dungeon'],
    requiredModules: () => ['missions', 'units', 'items'],
    miniDbFields: () => ['*'],
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
          let pageDb;
          if (server === 'gl') {
            pageDb = await getDatabaseForGlobal({ logger: tempLogger, commit, logPrefix });
          } else {
            pageDb = await getJson(`${baseUrl}/missions-${server}.json?${cacheBustingParam}`);
          }
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
    async getFilteredKeys ({ state, dispatch }, { filters, sorts }) {
      logger.debug('filters', filters);
      let keys; // leave blank, as it should default to full DB in worker

      const {
        exclusives = exclusiveFilterOptions.allValue,
      } = filters;
      if (!exclusiveFilterOptions.isAll(exclusives)) {
        keys = await dispatch('filterServerExclusiveKeys', { filter: exclusives, keys });
      }

      return dbWorker.getFilteredKeys(state.activeServer, { keys, ...filters }, sorts ? { ...sorts, possibleValues: state.possibleValues} : undefined);
    },
    async getSortedKeys ({ state }, { type, isAscending, keys }) {
      logger.debug('sorts', { type, isAscending, keys });
      return dbWorker.getSortedKeys(state.activeServer, keys, { type, isAscending, possibleValues: state.possibleValues });
    },
  },
};

