import { itemWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions } from './db.common';

const itemStore = {
  namespaced: true,
  state: {
    ...createState(),
  },
  mutations: {
    ...createMutations(),
  },
  getters: {
    itemById: state => id => state.pageDb[id],
  },
  actions: {
    ...createActions(itemWorker),
    async updateData ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      const baseUrl = `${location.origin}${location.pathname}static/bf-data`;
      for (const server of servers) {
        try {
          const itemDb = {};
          const loadPromises = [];
          let countFinished = 0;
          for (let i = 0; i <= 9; ++i) {
            loadPromises.push(downloadWorker
              .postMessage('getJson', [`${baseUrl}/items-${server}-${i}.json`])
              .then(tempData => {
                Object.keys(tempData)
                  .forEach(id => {
                    itemDb[id] = tempData[id];
                  });
                console.debug(server, 10 - (++countFinished), 'unit files remaining');
              }));
          }

          await Promise.all(loadPromises);
          await dispatch('saveData', { data: itemDb, server });
          console.debug('finished updating unit data for', server);
        } catch (err) {
          console.error(server, err);
        }
      }
      console.debug('finished updating data');
      commit('setLoadState', false);
    },
  },
};

export default itemStore;
