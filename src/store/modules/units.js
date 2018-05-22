import db from '../instances/dexie-instance';
import worker from '../instances/worker-instance';

const { units: unitsDb } = db;

const unitsStore = {
  namespaced: true,
  state: {
    'units-gl': {},
    'units-eu': {},
    'units-jp': {},
    loadingUnits: true,
  },
  mutations: {
    setUnitData (state, {data = {}, server = 'gl'}) {
      if (!state[`units-${server}`]) {
        throw Error(`Unknown server ${server}`);
      }
      state[`units-${server}`] = data;
    },
    setLoadState (state, mode) {
      state.loadingUnits = !!mode;
    },
  },
  getters: {
    unitById: state => (id, server = 'gl') => state[`units-${server}`][id],
  },
  actions: {
    async getUnitData ({ state }, server = 'gl') {
      // ensure server is valid
      if (!state[`units-${server}`]) {
        throw Error(`Unknown server ${server}`);
      }

      return unitsDb.where({server})
        .toArray()
        .then(results => {
          return results.length === 0 ? {} : { data: results[0].data, updateTime: results[0].updateTime };
        });
    },
    async setUnitData ({ commit, dispatch, state }, { data = {}, server = 'gl' }) {
      const currentData = await dispatch('getUnitData', server);
      console.debug('current data:', currentData, 'new data:', data);
      await unitsDb.put({
        server,
        data,
        updateTime: new Date(),
      });
      commit('setUnitData', data);
    },
    async unitsInit ({ commit, dispatch, state }) {
      const servers = ['gl', 'eu', 'jp'];
      commit('setLoadState', true);

      for (const server of servers) {
        try {
          const currentData = await dispatch('getUnitData', server);
          await dispatch('setUnitData', { data: currentData.data || {}, server });
        } catch (err) {
          console.error(err);
        }
      }
      commit('setLoadState', false);
    },
    async unitDataUpdate ({ commit, dispatch, state }, servers = []) {
      commit('setLoadState', true);
      const baseUrl = `${location.origin}${location.pathname}static/bf-data`;
      for (const server of servers) {
        try {
          const unitDb = {};
          const loadPromises = [];
          for (let i = 1; i <= 6; ++i) {
            loadPromises.push(worker
              .postMessage('getJson', [`${baseUrl}/units-${server}-${i}.json`])
              .then(tempData => {
                Object.keys(tempData)
                  .forEach(id => {
                    unitDb[id] = tempData[id];
                  });
              }));
          }

          await Promise.all(loadPromises);
          console.debug(server, unitDb);
        } catch (err) {
          console.error(server, err);
        }
      }
      commit('setLoadState', false);
    },
  },
};

export default unitsStore;
