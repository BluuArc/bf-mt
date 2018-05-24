import { extraSkillWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions } from './db.common';

const extraSkillStore = {
  namespaced: true,
  state: {
    ...createState(),
  },
  mutations: {
    ...createMutations(),
  },
  getters: {
    extraSkillById: state => id => state.pageDb[id],
  },
  actions: {
    ...createActions(extraSkillWorker),
    async updateData ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      const baseUrl = `${location.origin}${location.pathname}static/bf-data`;
      for (const server of servers) {
        try {
          const extraSkillDb = await downloadWorker.postMessage('getJson', [`${baseUrl}/es-${server}.json`]);
          await dispatch('saveData', { data: extraSkillDb, server });
          console.debug('finished updating extraSkill data for', server);
        } catch (err) {
          console.error(server, err);
        }
      }
      console.debug('finished updating data');
      commit('setLoadState', false);
    },
  },
};

export default extraSkillStore;
