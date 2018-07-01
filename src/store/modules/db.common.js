
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
    asyncFilters: {},
    cacheTimes: {
      gl: new Date('Jan 01 1969'),
      eu: new Date('Jan 01 1969'),
      jp: new Date('Jan 01 1969'),
    },
    updateTimes: {
      gl: new Date('Jan 01 1969'),
      eu: new Date('Jan 01 1969'),
      jp: new Date('Jan 01 1969'),
    },
    activeServerSymbol: Symbol('activeServer'),
    loadingMessage: '',
  };
};

export const createGetters = (multidexModuleName = 'units') => {
  return {
    getMultidexPathTo: state => (id, server = state.activeServer) => `/multidex/${multidexModuleName}/?viewId=${id}&server=${server}`,
    getById: state => id => state.pageDb[id.toString()],
  };
};

export const createMutations = () => {
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
        // console.debug(mode);
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
    setAsyncFilter (state, { name = '', data = {} }) {
      state.asyncFilters[name] = data;
    },
    setLoadingMessage (state, message = '') {
      state.loadingMessage = message;
    },
  };
};

export const createActions = (worker, downloadWorker, dbEntryName = 'units') => {
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
    async fetchUpdateTimes ({ commit, state }) {
      const url = `${location.origin}${location.pathname}static/bf-data/update-stats.json`;
      const data = await downloadWorker.postMessage('getJson', [url]);
      console.debug('update data', data);
      if (data[dbEntryName]) {
        Object.keys(data[dbEntryName]).forEach(server => {
          data[dbEntryName][server] = new Date(data[dbEntryName][server]);
        });
        return data[dbEntryName];
      }
      return {};
    },
    async saveData ({ commit, dispatch, state }, { data = {}, server = 'gl', cacheTime = new Date() }) {
      const updateTimes = await dispatch('fetchUpdateTimes');
      const updateTime = updateTimes[server] || cacheTime;
      if (updateTime === cacheTime) {
        console.warn(`[${dbEntryName}]: using cacheTime as updateTime`);
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
      const servers = ['gl', 'eu', 'jp'];
      commit('setLoadState', true);

      for (const server of servers) {
        commit('setLoadingMessage', `Loading stored statistics for ${server.toUpperCase()} server`);
        try {
          const currentData = await dispatch('getDbStatistics', server);
          await commit('updateStatisticsForServer', { server, cacheTime: currentData.cacheTime, length: currentData.keyLength, updateTime: currentData.updateTime });
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
};

export const knownConstants = {
  elements: ['fire', 'water', 'earth', 'thunder', 'light', 'dark'],
  gender: ['male', 'female', 'other'],
  unitKind: ['normal', 'evolution', 'enhancing', 'sale'],
  itemTypes: ['consumable', 'material', 'raid', 'sphere', 'evomat', 'summoner_consumable', 'ls_sphere'],
  exclusiveFilterOptions: {
    all: ['exclusive', 'non-exclusive'],
    exclusive: ['exclusive'],
    nonExclusive: ['non-exclusive'],
  },
  // default ternary options
  withWithoutTernaryOptions: {
    all: ['with', 'without'],
    with: ['with'],
    without: ['without'],
  },
  associatedUnitOptions: {
    all: ['with', 'without'],
    with: ['with'],
    without: ['without'],
  },
  craftableFilterOptions: {
    all: ['craftable', 'non-craftable'],
    craftable: ['craftable'],
    nonCraftable: ['non-craftable'],
  },
  usageFilterOptions: {
    all: ['used', 'unused'],
    used: ['used'],
    unused: ['unused'],
  },
  itemTypeMapping: {
    consumable: 'Item',
    material: 'Material',
    sphere: 'Sphere',
    evomat: 'Evo Material',
    summoner_consumable: 'Booster',
    raid: 'Raid Item',
    ls_sphere: 'LS Sphere',
  },
  servers: ['gl', 'eu', 'jp'],
  attackingProcs: ['1', '13', '14', '27', '28', '29', '47', '61', '64', '75', '11000'].concat(['46', '48', '97']),
  targetAreaMapping: {
    aoe: 'AOE',
    single: 'ST',
    random: 'RT',
  },
};

const commonFunctions = {
  createActions,
  createMutations,
  createState,
  isValidServer,
};

export default commonFunctions;
