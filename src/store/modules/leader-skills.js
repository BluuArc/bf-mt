import { leaderSkillWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions } from './db.common';

const leaderSkillStore = {
  namespaced: true,
  state: {
    ...createState(),
  },
  mutations: {
    ...createMutations(),
  },
  getters: {
    leaderSkillById: state => id => state.pageDb[id],
  },
  actions: {
    ...createActions(leaderSkillWorker),
    async updateData ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      const baseUrl = `${location.origin}${location.pathname}static/bf-data`;
      for (const server of servers) {
        try {
          const leaderSkillDb = await downloadWorker.postMessage('getJson', [`${baseUrl}/ls-${server}.json`]);
          await dispatch('saveData', { data: leaderSkillDb, server });
          console.debug('finished updating leaderSkill data for', server);
        } catch (err) {
          console.error(server, err);
        }
      }
      console.debug('finished updating data');
      commit('setLoadState', false);
    },
  },
};

export default leaderSkillStore;
