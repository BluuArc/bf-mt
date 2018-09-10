import { Logger } from '@/modules/Logger';
import { makeMultidexWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions, createGetters } from './helper';
import { getCacheBustingUrlParam } from '@/modules/utils';
import SWorker from '@/assets/sww.min';
// import union from 'lodash/union';

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
  },
  actions: {
    ...createActions(dbWorker, downloadWorker, logger, 'missions'),
    async updatePossibleValues ({ commit, state }) {
      commit('setLoadingMessage', 'Getting land, area, and dungeon values for missions');
      const result = await SWorker.run((keys, pageDb) => {
        const possible = { land: [], area: [], dungeon: [] };
        const locationTypes = ['land', 'area', 'dungeon'];
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
      }, [Object.keys(state.pageDb).sort((a, b) => +a - +b), state.pageDb]);
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
  },
};

