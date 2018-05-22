import dbWorker from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
const unitsDb = dbWorker.setTable('units');

const isValidServer = server => ['gl', 'eu', 'jp'].includes(server);

const unitsStore = {
  namespaced: true,
  state: {
    unitKeyLength: {
      gl: 0,
      eu: 0,
      jp: 0,
    },
    activeServer: 'gl',
    unitData: {},
    loadingUnits: true,
    cacheTimes: {
      gl: new Date('Jan 01 1969'),
      eu: new Date('Jan 01 1969'),
      jp: new Date('Jan 01 1969'),
    },
  },
  mutations: {
    setActiveServer (state, { data = {}, server = 'gl' }) {
      if (!isValidServer(server)) {
        throw Error(`Invalid server "${server}"`);
      }
      state.activeServer = server;
      state.unitData = data;
      state.unitKeyLength[server] = Object.keys(data).length;
    },
    setLoadState (state, mode) {
      state.loadingUnits = !!mode;
    },
    updateStatisticsForServer (state, { length = 0, server = 'gl', updateTime = new Date() }) {
      if (!isValidServer(server)) {
        throw Error(`Invalid server "${server}"`);
      }
      state.unitKeyLength[server] = length;
      state.cacheTimes[server] = updateTime;
    },
  },
  getters: {
    unitById: state => id => state.unitData[id],
  },
  actions: {
    async getUnitData ({ state }, server = 'gl') {
      // ensure server is valid
      if (!isValidServer(server)) {
        throw Error(`Invalid server "${server}"`);
      }
      return unitsDb.get({ server })
        .then(results => {
          return results.length === 0 ? {} : { data: results[0].data, updateTime: results[0].updateTime };
        });
    },
    async getUnitDataMini ({ state }, server = 'gl') {
      if (!isValidServer(server)) {
        throw Error(`Invalid server "${server}"`);
      }
      const updateTime = await unitsDb.getFieldInEntry({ server }, 'updateTime').then(date => new Date(date));
      const keyLength = await unitsDb.getFieldKeyLength({ server }, 'data');
      return { updateTime, keyLength };
    },
    async setActiveServer ({ commit, dispatch }, { server = 'gl' }) {
      if (!isValidServer(server)) {
        throw Error(`Invalid server "${server}"`);
      }

      const data = await dispatch('getUnitData', server);
      commit('setUnitData', { server, ...data });
    },
    async saveUnitData ({ commit, dispatch }, { data = {}, server = 'gl', updateTime = new Date() }) {
      await unitsDb.put({
        server,
        data,
        updateTime,
      });
      commit('updateStatisticsForServer', { server, updateTime, length: Object.keys(data).length });
    },
    async unitsInit ({ commit, dispatch }) {
      const servers = ['gl', 'eu', 'jp'];
      commit('setLoadState', true);

      for (const server of servers) {
        try {
          const currentData = await dispatch('getUnitDataMini', server);
          await commit('updateStatisticsForServer', { server, updateTime: currentData.updateTime, length: currentData.keyLength });
        } catch (err) {
          console.error(err);
        }
      }
      commit('setLoadState', false);
    },
    async unitDataUpdate ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      const baseUrl = `${location.origin}${location.pathname}static/bf-data`;
      for (const server of servers) {
        try {
          const unitDb = {};
          const loadPromises = [];
          for (let i = 1; i <= 6; ++i) {
            loadPromises.push(downloadWorker
              .postMessage('getJson', [`${baseUrl}/units-${server}-${i}.json`])
              .then(tempData => {
                Object.keys(tempData)
                  .forEach(id => {
                    unitDb[id] = tempData[id];
                  });
              }));
          }

          await Promise.all(loadPromises);
          await dispatch('saveUnitData', { data: unitDb, server });
        } catch (err) {
          console.error(server, err);
        }
      }
      commit('setLoadState', false);
    },
    async unitDataDelete ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      for (const server of servers) {
        await dispatch('saveUnitData', { data: {}, server });
      }
      commit('setLoadState', false);
    },
  },
};

export default unitsStore;
