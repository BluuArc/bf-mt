import { unitWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions } from './db.common';

const unitsStore = {
  namespaced: true,
  state: {
    ...createState(),
  },
  mutations: {
    ...createMutations(),
  },
  getters: {
    unitById: state => id => state.pageDb[id],
    getImageUrls: state => id => {
      const cdnUrls = {
        eu: 'http://static-bravefrontier.gumi-europe.net/content',
        gl: 'http://dlc.bfglobal.gumi.sg/content',
        jp: 'http://cdn.android.brave.a-lim.jp',
      };

      const baseUrl = `${cdnUrls[state.activeServer]}/unit/img`;

      return {
        ills_full: `${baseUrl}/unit_ills_full_${id}.png`,
        ills_thum: `${baseUrl}/unit_ills_thum_${id}.png`,
        anime: `${baseUrl}/unit_thum_${id}.png`,
        ills_battle: `${baseUrl}/unit_ills_battle_${id}.png`,
      };
    },
  },
  actions: {
    ...createActions(unitWorker),
    async updateData ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      const baseUrl = `${location.origin}${location.pathname}static/bf-data`;
      for (const server of servers) {
        try {
          const unitDb = {};
          const loadPromises = [];
          let countFinished = 0;
          for (let i = 1; i <= 6; ++i) {
            loadPromises.push(downloadWorker
              .postMessage('getJson', [`${baseUrl}/units-${server}-${i}.json`])
              .then(tempData => {
                Object.keys(tempData)
                  .forEach(id => {
                    unitDb[id] = tempData[id];
                  });
                console.debug(server, 6 - (++countFinished), 'unit files remaining');
              }));
          }

          await Promise.all(loadPromises);
          await dispatch('saveData', { data: unitDb, server });
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

export default unitsStore;
