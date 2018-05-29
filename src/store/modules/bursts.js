import { burstWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions } from './db.common';
import SWorker from '../../assets/sww.min';
import union from 'lodash/union';

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
    async getFilteredKeys ({ dispatch, state, commit }, filters = {}) {
      // TODO: add call for advanced filtering using dexie-client worker
      console.debug(filters);
      const keys = Object.keys(state.pageDb);
      if (Object.keys(filters).length === 0) {
        return keys;
      }

      // get local filters
      const { exclusives = [] } = filters;
      let otherKeys = [];
      const filtersChanged = state.asyncFilters.exclusives !== exclusives.concat([state.activeServer]).join('-');
      // possible values: exlusive, non-exclusive
      // length or 2 or 0 => no need to retrieve
      if (exclusives.length === 1 && filtersChanged) {
        const servers = ['gl', 'eu', 'jp'].filter(s => s !== state.activeServer);
        const serverKeys = await Promise.all(servers.map(server => burstWorker.getFieldKeys({ server }, 'data')));
        otherKeys = union(...serverKeys).map(i => +i).sort((a, b) => a - b);
      } else if (!filtersChanged) {
        otherKeys = state.asyncFilters['exclusives-data'];
      }
      // console.debug({ otherKeys });
      if (filtersChanged) {
        commit('setAsyncFilter', { name: 'exclusives', data: exclusives.concat([state.activeServer]).join('-') });
        commit('setAsyncFilter', { name: 'exclusives-data', data: otherKeys });
      }

      const result = await SWorker.run((keys, filters, otherKeys, pageDb) => {
        const { name = '', exclusives = [], associatedUnits = [] } = filters;
        return keys.filter(key => {
          const entry = pageDb[key];
          const fitsName = (!name ? true : entry.name.toLowerCase().includes(name.toLowerCase()));

          const isInOtherServer = otherKeys.includes(entry.id);
          const fitsExclusive = (exclusives.length !== 1 ? exclusives.length === 2 : ((exclusives[0] === 'exclusive' && !isInOtherServer) || (exclusives[0] === 'non-exclusive' && isInOtherServer)));

          const hasAssociatedUnits = Array.isArray(entry.associated_units) && entry.associated_units.length > 0;
          const fitsAssociatedUnits = (associatedUnits.length !== 1 ? associatedUnits.length === 2 : ((associatedUnits[0] === 'with' && hasAssociatedUnits) || (associatedUnits[0] === 'without' && !hasAssociatedUnits)));

          return fitsName && fitsExclusive && fitsAssociatedUnits;
        });
      }, [keys, filters, otherKeys, state.pageDb]);
      return result;
    },
  },
};

export default burstStore;
