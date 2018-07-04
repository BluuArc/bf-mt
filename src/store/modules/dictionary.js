import { dictionaryWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import SWorker from '../../assets/sww.min';
import { createState, createMutations, createActions, createGetters } from './db.common';
import union from 'lodash/union';

const dictionaryStore = {
  namespaced: true,
  state: {
    ...createState(),
  },
  mutations: {
    ...createMutations(),
  },
  getters: {
    ...createGetters('dictionary'),
    dictionaryByID: state => id => state.pageDb[id],
  },
  actions: {
    ...createActions(dictionaryWorker, downloadWorker, 'dictionary'),
    async updateData ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      const baseUrl = `${location.origin}${location.pathname}static/bf-data`;
      for (const server of servers) {
        const logPrefix = `Downloading data for ${server.toUpperCase()} server`;
        commit('setLoadingMessage', logPrefix);
        try {
          const dictionaryDb = {};
          const loadPromises = [];
          let countFinished = 0;
          for (let i = 0; i <= 9; ++i) {
            loadPromises.push(downloadWorker
              .postMessage('getJson', [`${baseUrl}/dictionary-${server}-${i}.json`])
              .then(tempData => {
                Object.keys(tempData)
                  .forEach(id => {
                    dictionaryDb[id] = tempData[id].en || '';
                  });
                console.debug(server, 10 - (++countFinished), 'dictionary files remaining');
                commit('setLoadingMessage', `${logPrefix} (${10 - countFinished} files remaining)`);
              }));
          }

          await Promise.all(loadPromises);
          commit('setLoadingMessage', `Storing data for ${server.toUpperCase()} server`);
          await dispatch('saveData', { data: dictionaryDb, server });
          console.debug('finished updating burst data for', server);
        } catch (err) {
          console.error(server, err);
        }
      }
      console.debug('finished updating data');
      commit('setLoadState', false);
    },
    async getFilteredKeys ({ dispatch, state, commit }, inputFilters = {}) {
      // TODO: add call for advanced filtering using dexie-client worker
      const { forceUpdate, ...filters } = inputFilters;
      console.debug(filters);
      const keys = Object.keys(state.pageDb);
      if (Object.keys(filters).length === 0) {
        return keys;
      }

      // get local filters
      const { exclusives = [] } = filters;
      let otherKeys = [];
      const filtersChanged = !!forceUpdate || state.asyncFilters.exclusives !== exclusives.concat([state.activeServer]).join('-');
      // possible values: exlusive, non-exclusive
      // length or 2 or 0 => no need to retrieve
      if (exclusives.length === 1 && filtersChanged) {
        const servers = ['gl', 'eu', 'jp'].filter(s => s !== state.activeServer);
        const serverKeys = await Promise.all(servers.map(server => dictionaryWorker.getFieldKeys({ server }, 'data')));
        otherKeys = union(...serverKeys).sort((a, b) => +a - +b);
      } else if (!filtersChanged) {
        otherKeys = state.asyncFilters['exclusives-data'];
      }
      // console.debug({ otherKeys });
      if (filtersChanged) {
        commit('setAsyncFilter', { name: 'exclusives', data: exclusives.concat([state.activeServer]).join('-') });
        commit('setAsyncFilter', { name: 'exclusives-data', data: otherKeys });
      }

      const result = await SWorker.run((keys, filters, otherKeys, pageDb) => {
        const { name = '' } = filters;
        return keys.filter(key => {
          const entry = pageDb[key];
          const fitsName = (!name ? true : key.toLowerCase().includes(name.toLowerCase()));
          const fitsDescription = (!name ? true : entry.toLowerCase().includes(name.toLowerCase()));

          return fitsName || fitsDescription;
        });
      }, [keys, filters, otherKeys, state.pageDb]);
      return result;
    },
  },
};

export default dictionaryStore;
