import { servers, exclusiveFilterOptions } from '@/modules/constants';
import getUpdateTimes from '@/store/instances/update-data-singleton';
import SWorker from '@/assets/sww.min';
// eslint-disable-next-line no-unused-vars
import logger from '@/modules/Logger';
const defaultStartDate = new Date('Jan 01 1969');

export const createState = () => {
  const numEntries = {};
  const cacheTimes = {};
  const updateTimes = {};
  const keyLists = {};

  servers.forEach(server => {
    numEntries[server] = 0;
    cacheTimes[server] = defaultStartDate;
    updateTimes[server] = defaultStartDate;
    keyLists[server] = [];
  });
  return {
    numEntries,
    activeServer: 'gl',
    pageDb: {},
    isLoading: true,
    cacheTimes,
    updateTimes,
    activeServerSymbol: Symbol('activeServer'),
    loadingMessage: '',
    filterUrl: '',
    sortOptions: null,
    keyLists, // for caching key lists of other servers
    buffSearchCache: {}, // for caching searches related to procs/passives
    entryCache: {}, // for caching entries
  };
};

export const createGetters = (multidexModuleName = 'units') => {
  return {
    miniDbFields: () => ['id', 'name'],
    getMultidexPathTo: state => (id, server = state.activeServer) => {
      // logger.todo('check if filters are properly retrieved for', multidexModuleName);
      const params = [
          id && `viewId=${id}&server=${server}`,
          state.filterUrl && `filters=${state.filterUrl}`,
        ].filter(val => val)
        .join('&');
      return [`/multidex/${multidexModuleName}`, params].filter(val => val).join('/?');
    },
    getById: state => id => state.pageDb[id.toString()],
    getMultidexRouteParamsTo: state => (id, server = state.activeServer) => ({
      path: `/multidex/${multidexModuleName}/`,
      query: {
        viewId: id,
        server,
      },
    }),
  };
};

export const isValidServer = server => servers.includes(server);
export const createMutations = (logger) => { // eslint-disable-line no-unused-vars
  return {
    setActiveServer (state, { data = {}, server = 'gl', commitData = true, needsReload = false }) {
      if (!isValidServer(server)) {
        throw Error(`Invalid server "${server}"`);
      }
      state.activeServer = server;
      if (commitData) {
        state.pageDb = data;
        state.pageDb[state.activeServerSymbol] = server;
        state.numEntries[server] = Object.keys(data).length;
      } else if (needsReload) {
        state.pageDb[state.activeServerSymbol] = '';
      }

      // different server -> different entries
      state.buffSearchCache = {};
      state.entryCache = {};
    },
    setLoadState (state, mode) {
      if (typeof mode !== 'object') {
        state.isLoading = !!mode;
        // clear message if done loading
        if (!mode) {
          state.loadingMessage = '';
        }
      } else {
        const { loadState, message } = mode;
        state.isLoading = !!loadState;
        if (message !== undefined) {
          state.loadingMessage = message;
        }
      }
    },
    updateStatisticsForServer (state, { length = 0, server = 'gl', cacheTime = new Date(), updateTime = new Date() }) {
      if (!isValidServer(server)) {
        throw Error(`Invalid server "${server}"`);
      }
      state.numEntries[server] = length;
      state.cacheTimes[server] = cacheTime;
      state.updateTimes[server] = updateTime;
      state.keyLists[server] = []; // reset cached keylist for server
      state.buffSearchCache = {};
      state.entryCache = {};
    },
    setLoadingMessage (state, message = '') {
      logger.debug('LOADING MESSAGE:', message);
      state.loadingMessage = message;
    },
    setFilterUrl (state, url = '') {
      state.filterUrl = url;
    },
    setSortOptions (state, options = null) {
      state.sortOptions = options;
    },
    setKeyListForServer (state, { server = 'gl', keys = [] }) {
      state.keyLists[server] = keys;
    },
    setBuffSearchCache (state, value) {
      state.buffSearchCache = value;
    },
    setEntryForEntryCache (state, { key, value }) {
      state.entryCache[key] = value;
      // TODO: limit number of entries here?
      // probably need to keep track of add order in another array to know which to remove first
    },
  };
};

export const createActions = (worker, downloadWorker, logger, dbEntryName = 'units') => {
  /* eslint-disable no-unused-vars */
  return {
    getMiniDb ({ state, getters }, server = 'gl') {
      if (!isValidServer(server)) {
        throw Error(`Invalid server "${server}"`);
      }
      return worker.getMiniDb(server, undefined, getters.miniDbFields);
    },
    async getDbStatistics ({ state }, server = 'gl') {
      if (!isValidServer(server)) {
        throw Error(`Invalid server "${server}"`);
      }
      const result = await worker.getDbStats({ server });
      if (result) {
        const { cacheTime, keyLength, updateTime } = result;
        return { cacheTime, keyLength, updateTime };
      } else {
        return { keyLength: 0 };
      }
    },
    async setActiveServer ({ commit, dispatch }, server = 'gl') {
      if (!isValidServer(server)) {
        throw Error(`Invalid server "${server}"`);
      }

      commit('setLoadState', { loadState: true, message: `Changing server to ${server}` });
      commit('setActiveServer', { server, commitData: false, needsReload: true });
      commit('setLoadState', false);
    },
    async ensurePageDbSyncWithServer ({ commit, dispatch, state }) {
      if (state.pageDb[state.activeServerSymbol] !== state.activeServer) {
        commit('setLoadState', { loadState: true, message: 'Getting data for active server' });
        const data = await dispatch('getMiniDb', state.activeServer);
        commit('setActiveServer', { server: state.activeServer, data });
        commit('setLoadState', false);
      }
    },
    async fetchUpdateTimes () {
      const data = await getUpdateTimes();
      return data[dbEntryName] || {};
    },
    async saveData ({ commit, dispatch, state }, { data = {}, server = 'gl', cacheTime = new Date() }) {
      const updateTimes = await dispatch('fetchUpdateTimes');
      const updateTime = updateTimes[server] || cacheTime;
      if (updateTime === cacheTime) {
        logger.warn(`[${dbEntryName}]: using cacheTime as updateTime`);
      }
      await worker.put({
        server,
        data,
        cacheTime,
        updateTime,
      });
      commit('updateStatisticsForServer', { server, cacheTime, updateTime, length: Object.keys(data).length });
      if (server === state.activeServer) {
        const currentLoadState = state.isLoading;
        const currentMessage = state.loadingMessage;
        // update store with new data
        await dispatch('setActiveServer', server);
        if (currentLoadState) {
          commit('setLoadState', { loadState: currentLoadState, message: currentMessage });
        }
      }
    },
    async init ({ commit, dispatch }) {
      commit('setLoadState', true);

      for (const server of servers) {
        logger.debug('initializing data for', server);
        commit('setLoadingMessage', `Loading stored statistics for ${server.toUpperCase()} server`);
        try {
          const currentData = await dispatch('getDbStatistics', server);
          commit('updateStatisticsForServer', { server, cacheTime: currentData.cacheTime, length: currentData.keyLength, updateTime: currentData.updateTime });
        } catch (err) {
          logger.error(err);
        }
      }

      commit('setLoadState', false);
    },
    async updateData ({ commit, dispatch }, servers = []) {
      throw Error('Need to implement per module');
    },
    async deleteData ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      for (const server of servers) {
        commit('setLoadingMessage', `Deleting stored data for ${server.toUpperCase()} server`);
        await dispatch('saveData', { data: {}, server });
      }
      commit('setLoadState', false);
    },
    async getById ({ state, commit }, id) {
      if (!state.pageDb.hasOwnProperty(id)) {
        return undefined;
      }

      let entry = state.entryCache[id];
      if (!entry) {
        logger.debug('cache miss for id', id);
        entry = await worker.getById(state.activeServer, id);
        commit('setEntryForEntryCache', { key: id, value: entry });
      } else {
        logger.debug('cache hit for id', id, entry);
      }
      return entry;
    },
    async getKeysForServer ({ state, commit }, server = 'gl') {
      if (!state.keyLists[server]) {
        logger.error('unknown server', server);
        return [];
      }
      let keys = state.keyLists[server];
      if (keys.length === 0) {
        logger.debug('no cached key list found for', server, 'Getting new key list');
        keys = await worker.getFieldKeys({ server }, 'data');
        commit('setKeyListForServer', { server, keys });
      }
      return keys;
    },
    async filterServerExclusiveKeys ({ dispatch, state }, { filter = exclusiveFilterOptions.allValue, keys = [] }) {
      let otherKeys = [];
      if (!exclusiveFilterOptions.isAll(filter)) {
        const otherServers = servers.filter(s => s !== state.activeServer);
        const serverKeys = await Promise.all(otherServers.map(s => dispatch('getKeysForServer', s)));
        otherKeys = await SWorker.run((keysA, keysB) => {
          const unionResult = keysA.slice()
            .concat(keysB.filter(b => !keysA.includes(b)))
            .sort((a, b) => +a - +b);
          return unionResult;
        }, [...serverKeys]);
      }

      const result = await SWorker.run((exclusivesFilter, otherKeys, ternaryValues, inputKeys, pageDb) => {
        return inputKeys.filter(key => {
          const entry = pageDb[key];
          const isExclusive = !otherKeys.includes((entry.id || '').toString());
          return (
            exclusivesFilter === ternaryValues.all ||
            (exclusivesFilter === ternaryValues.truthy && isExclusive) ||
            (exclusivesFilter === ternaryValues.falsy && !isExclusive));
        });
      }, [filter, otherKeys, exclusiveFilterOptions.values, keys, state.pageDb]);
      return result;
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

      return worker.getFilteredKeys(state.activeServer, { keys, ...filters }, sorts);
    },
    async getSortedKeys ({ state }, { type, isAscending, keys }) {
      logger.debug('sorts', { type, isAscending, keys });
      return worker.getSortedKeys(state.activeServer, keys, { type, isAscending });
    },
  };
  /* eslint-enable no-unused-vars */
};
