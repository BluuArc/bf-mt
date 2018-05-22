
export const isValidServer = server => ['gl', 'eu', 'jp'].includes(server);
export const createState = () => {
  return {
    numEntries: {
      gl: 0,
      eu: 0,
      jp: 0,
    },
    activeServer: 'gl',
    pageDb: {},
    isLoading: true,
    cacheTimes: {
      gl: new Date('Jan 01 1969'),
      eu: new Date('Jan 01 1969'),
      jp: new Date('Jan 01 1969'),
    },
  };
};

export const createMutations = () => {
  return {
    setActiveServer (state, { data = {}, server = 'gl' }) {
      if (!isValidServer(server)) {
        throw Error(`Invalid server "${server}"`);
      }
      state.activeServer = server;
      state.pageDb = data;
      state.numEntries[server] = Object.keys(data).length;
    },
    setLoadState (state, mode) {
      state.isLoading = !!mode;
    },
    updateStatisticsForServer (state, { length = 0, server = 'gl', updateTime = new Date() }) {
      if (!isValidServer(server)) {
        throw Error(`Invalid server "${server}"`);
      }
      state.numEntries[server] = length;
      state.cacheTimes[server] = updateTime;
    },
  };
};

export const createActions = (worker) => {
  return {
    getMiniDb ({ state }, server = 'gl') {
      // ensure server is valid
      if (!isValidServer(server)) {
        throw Error(`Invalid server "${server}"`);
      }
      return worker.getMiniDb(server);
    },
    async getDbStatistics ({ state }, server = 'gl') {
      if (!isValidServer(server)) {
        throw Error(`Invalid server "${server}"`);
      }
      const updateTime = await worker.getFieldInEntry({ server }, 'updateTime').then(date => new Date(date));
      const keyLength = await worker.getFieldKeyLength({ server }, 'data');
      return { updateTime, keyLength };
    },
    async setActiveServer ({ commit, dispatch }, server = 'gl') {
      if (!isValidServer(server)) {
        throw Error(`Invalid server "${server}"`);
      }

      commit('setLoadState', true);
      const data = await dispatch('getMiniDb', server);
      commit('setActiveServer', { server, data });
      commit('setLoadState', false);
    },
    async saveData ({ commit, dispatch, state }, { data = {}, server = 'gl', updateTime = new Date() }) {
      await worker.put({
        server,
        data,
        updateTime,
      });
      commit('updateStatisticsForServer', { server, updateTime, length: Object.keys(data).length });
      if (server === state.activeServer) {
        const currentLoadState = state.isLoading;
        // update store with new data
        await dispatch('setActiveServer', server);
        if (currentLoadState) {
          commit('setLoadState', currentLoadState);
        }
      }
    },
    async init ({ commit, dispatch }) {
      const servers = ['gl', 'eu', 'jp'];
      commit('setLoadState', true);

      for (const server of servers) {
        try {
          const currentData = await dispatch('getDbStatistics', server);
          await commit('updateStatisticsForServer', { server, updateTime: currentData.updateTime, length: currentData.keyLength });
        } catch (err) {
          console.error(err);
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
        await dispatch('saveData', { data: {}, server });
      }
      commit('setLoadState', false);
    },
  };
};

const commonFunctions = {
  createActions,
  createMutations,
  createState,
  isValidServer,
};

export default commonFunctions;
