import { unitWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import SWorker from '../../assets/sww.min';
import { createState, createMutations, createActions, createGetters } from './db.common';
import union from 'lodash/union';

const unitsStore = {
  namespaced: true,
  state: {
    ...createState(),
  },
  mutations: {
    ...createMutations(),
  },
  getters: {
    ...createGetters('units'),
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
    ...createActions(unitWorker, downloadWorker, 'units'),
    async updateData ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      const baseUrl = `${location.origin}${location.pathname}static/bf-data`;
      for (const server of servers) {
        const logPrefix = `Downloading data for ${server.toUpperCase()} server`;
        commit('setLoadingMessage', logPrefix);
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
                    if (+id !== 1) {
                      unitDb[id] = tempData[id];
                    }
                  });
                console.debug(server, 6 - (++countFinished), 'unit files remaining');
                commit('setLoadingMessage', `${logPrefix} (${6 - countFinished} files remaining)`);
              }));
          }

          await Promise.all(loadPromises);
          commit('setLoadingMessage', `Storing data for ${server.toUpperCase()} server`);
          await dispatch('saveData', { data: unitDb, server });
          console.debug('finished updating unit data for', server);
        } catch (err) {
          console.error(server, err);
        }
      }
      console.debug('finished updating data');
      commit('setLoadState', false);
    },
    async getFilteredKeys ({ dispatch, state, commit }, inputFilters = {}) {
      const { forceUpdate, ...filters } = inputFilters;
      console.debug(filters);
      let keys;
      if (filters.procs.length === 0 && filters.passives.length === 0) {
        keys = Object.keys(state.pageDb);
      } else {
        const searchQuery = {
          procs: filters.procs,
          passives: filters.passives,
          procAreas: filters.procBuffSearchOptions,
          passiveAreas: filters.passiveBuffSearchOptions,
        };
        const filteredDb = await unitWorker.getMiniDb(state.activeServer, searchQuery);
        keys = Object.keys(filteredDb);
      }
      console.debug(keys);
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
        const serverKeys = await Promise.all(servers.map(server => unitWorker.getFieldKeys({ server }, 'data')));
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
        const { name = '', elements = [], kind = [], gender = [], rarity = [], exclusives = [] } = filters;
        return keys.filter(key => {
          const entry = pageDb[key];
          const fitsName = (!name ? true : entry.name.toLowerCase().includes(name.toLowerCase()));
          const fitsID = (!name ? true : key.toString().includes(name) || (entry.id || '').toString().includes(name));
          const fitsElement = elements.includes(entry.element);
          const fitsGender = gender.includes(entry.gender);
          const fitsRarity = rarity.includes(entry.rarity);

          // need to flip evo/enhancing as they're marked wrong in the data at time of writing
          // default to enhancing so that Omni Frog and Omni Emperor aren't hidden by default
          const kindEntry = (entry.kind === 'evo' ? 'enhancing' : entry.kind === 'enhancing' ? 'evolution' : entry.kind) || 'enhancing';
          const fitsKind = kind.includes(kindEntry);

          // const isInOtherServer = sortedIndexOf(otherKeys, entry.id) > -1;
          const isInOtherServer = otherKeys.includes(entry.id.toString());
          const fitsExclusive = (exclusives.length !== 1 ? exclusives.length === 2 : ((exclusives[0] === 'exclusive' && !isInOtherServer) || (exclusives[0] === 'non-exclusive' && isInOtherServer)));

          const fitsFilters = (fitsName || fitsID) && fitsElement && fitsKind && fitsGender && fitsRarity && fitsExclusive;
          // if (!fitsFilters) {
          //   console.debug(key, entry.name, {fitsName, fitsElement, fitsKind, fitsGender, fitsRarity, fitsExclusive});
          // }
          return fitsFilters;
        });
      }, [keys, filters, otherKeys, state.pageDb]);
      return result;
    },
  },
};

export default unitsStore;
