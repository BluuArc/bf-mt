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
    async storeSquad ({ commit, dispatch }, { squad, server, updateInternalList = false }) {
      const resultKey = await dbClient.put({ squad, server });

      if (updateInternalList) {
        const squads = await dispatch('getSquads', server);
        commit('setSquadList', squads);
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
    // TODO: delete squad
  },
};
