import { Logger } from '@/modules/Logger';
import { makeTableInstance } from '@/modules/BfmtDatabase/client';

// eslint-disable-next-line no-unused-vars
const logger = new Logger({ prefix: '[STORE/SQUADS]' });
const dbClient = makeTableInstance('squads');
export default {
  namespaced: true,
  state: {
    squads: [],
  },
  mutations: {
    setSquadList (state, squads = []) {
      state.squads = squads;
    },
  },
  actions: {
    async updateSquadList ({ commit, dispatch }, server) {
      const squads = await dispatch('getSquads', server);
      commit('setSquadList', squads);
    },
    async storeSquad ({ dispatch }, { squad, server, id, updateInternalList = false }) {
      let resultKey;
      if (!isNaN(id)) { // replace old entry
        resultKey = await dbClient.put({ squad, server, id: +id });
      } else { // insert new entry
        resultKey = await dbClient.put({ squad, server });
      }

      if (updateInternalList) {
        await dispatch('updateSquadList', server);
      }

      return resultKey;
    },
    getSquads (context, server) {
      return dbClient.get({ server });
    },
    async getSquadById (context, id) {
      const result = await dbClient.get({ id: +id });
      return result[0];
    },
    async deleteSquad ({ dispatch }, { id, server, updateInternalList = false }) {
      const resultKey = await dbClient.delete(+id);

      if (updateInternalList) {
        await dispatch('updateSquadList', server);
      }

      return resultKey;
    },
  },
};
