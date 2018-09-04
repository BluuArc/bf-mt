import { servers } from '@/modules/constants';
import getUpdateTimes from '@/store/instances/update-data-singleton';
const defaultStartDate = new Date('Jan 01 1969');

export const createState = () => {
  const numEntries = {};
  const cacheTimes = {};
  const updateTimes = {};

  servers.forEach(server => {
    numEntries[server] = 0;
    cacheTimes[server] = defaultStartDate;
    updateTimes[server] = defaultStartDate;
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
  };
};

export const createGetters = (multidexModuleName = 'units') => {
  return {
    getMultidexPathTo: state => (id, server = state.activeServer) => `/multidex/${multidexModuleName}/?viewId=${id}&server=${server}`,
    getById: state => id => state.pageDb[id.toString()],
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
  };
};

export const createActions = (worker, downloadWorker, logger, dbEntryName = 'units') => {
  /* eslint-disable no-unused-vars */
  return {
    getMiniDb ({ state }, server = 'gl') {
      if (!isValidServer(server)) {
        throw Error(`Invalid server "${server}"`);
      }
      return worker.getMiniDb(server);
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
    getById ({ dispatch, state }, id) {
      if (!state.pageDb.hasOwnProperty(id)) {
        return undefined;
      }

      return worker.getById(state.activeServer, id);
    },
  };
  /* eslint-enable no-unused-vars */
};
