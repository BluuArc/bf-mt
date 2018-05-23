import { burstWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions } from './db.common';

const burstStore = {
  namespaced: true,
  state: {
    ...createState(),
  },
  mutations: {
    ...createMutations(),
  },
  getters: {
    burstById: state => id => state.pageDb[id],
  },
  actions: {
    ...createActions(burstWorker),
    async updateData ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      const baseUrl = `${location.origin}${location.pathname}static/bf-data`;
      for (const server of servers) {
        try {
          const burstDb = {};
          const loadPromises = [];
          let countFinished = 0;
          for (let i = 0; i <= 9; ++i) {
            loadPromises.push(downloadWorker
              .postMessage('getJson', [`${baseUrl}/bbs-${server}-${i}.json`])
              .then(tempData => {
                Object.keys(tempData)
                  .forEach(id => {
                    burstDb[id] = tempData[id];
                  });
                console.debug(server, 10 - (++countFinished), 'burst files remaining');
              }));
          }

          await Promise.all(loadPromises);
          await dispatch('saveData', { data: burstDb, server });
          console.debug('finished updating burst data for', server);
        } catch (err) {
          console.error(server, err);
        }
      }
      console.debug('finished updating data');
      commit('setLoadState', false);
    },
  },
};

export default burstStore;
