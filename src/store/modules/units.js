import db from '../dexie-instance';

const { units: unitsDb } = db;

const unitsStore = {
  namespaced: true,
  state: {
    'units-gl': {},
    'units-eu': {},
    'units-jp': {},
  },
  mutations: {
    setUnitData (state, {data = {}, server = 'gl'}) {
      if (!state[`units-${server}`]) {
        throw Error(`Unknown server ${server}`);
      }
      state[`units-${server}`] = data;
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
    async unitsInit ({ commit, dispatch }) {
      const servers = ['gl', 'eu', 'jp'];
      for (const server of servers) {
        const currentData = await dispatch('getUnitData', server);
        await dispatch('setUnitData', { data: currentData.data || {}, server });
      }
    },
  },
};

export default unitsStore;
