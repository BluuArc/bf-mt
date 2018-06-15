import { itemWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions, createGetters } from './db.common';
import SWorker from '../../assets/sww.min';
import union from 'lodash/union';

const itemStore = {
  namespaced: true,
  state: {
    ...createState(),
  },
  mutations: {
    ...createMutations(),
  },
  getters: {
    ...createGetters('items'),
    itemById: state => id => state.pageDb[id],
    getImageUrl: state => id => {
      const cdnUrls = {
        eu: 'http://static-bravefrontier.gumi-europe.net/content',
        gl: 'http://dlc.bfglobal.gumi.sg/content',
        jp: 'http://cdn.android.brave.a-lim.jp',
      };
      const baseUrl = `${cdnUrls[state.activeServer]}/item`;
      if (state.pageDb.hasOwnProperty(id)) {
        return `${baseUrl}/${state.pageDb[id].thumbnail}`;
      } else {
        return baseUrl;
      }
    },
    getSphereCategory: state => num => {
      const categories = {
        0: 'None',
        1: 'Status Enhancing',
        2: 'Critical',
        3: 'Drop',
        4: 'Ailment Inducing',
        5: 'Element Fusion',
        6: 'BB Gauge',
        7: 'HP Recovery',
        8: 'Target Setting',
        9: 'Damage Deflecting',
        10: 'Damage Reducing',
        11: 'Spark',
        12: 'Defense Piercing',
        13: 'Attack Boosting',
        14: 'Special',
      };
      return categories[+num];
    },
  },
  actions: {
    ...createActions(itemWorker, downloadWorker, 'items'),
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
                console.debug(server, 10 - (++countFinished), 'item files remaining');
              }));
          }

          await Promise.all(loadPromises);
          await dispatch('saveData', { data: itemDb, server });
          console.debug('finished updating item data for', server);
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
        const serverKeys = await Promise.all(servers.map(server => itemWorker.getFieldKeys({ server }, 'data')));
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
        const { name = '', rarity = [], exclusives = [], itemTypes = [], sphereTypes = [], craftables = [], usage = [] } = filters;
        const includeNoneSphereType = sphereTypes.includes(0);
        const includeAnySphereType = sphereTypes.length === 15;
        return keys.filter(key => {
          const entry = pageDb[key];
          const fitsName = (!name ? true : entry.name.toLowerCase().includes(name.toLowerCase()));
          const fitsRarity = rarity.includes(entry.rarity);
          const fitsItemType = itemTypes.includes(entry.type) || (itemTypes.includes('raid') && entry.raid);

          const hasSphereType = entry['sphere type'] !== undefined || entry.type === 'sphere' || entry.type === 'ls_sphere';
          const fitsSphereType = includeAnySphereType || (hasSphereType && (sphereTypes.includes(entry['sphere type']))) || (includeNoneSphereType && !entry['sphere type']);

          const isInOtherServer = otherKeys.includes(entry.id.toString());
          const fitsExclusive = (exclusives.length !== 1 ? exclusives.length === 2 : ((exclusives[0] === 'exclusive' && !isInOtherServer) || (exclusives[0] === 'non-exclusive' && isInOtherServer)));

          const isCraftable = !!entry.recipe;
          const fitsCraftable = (craftables.length !== 1 ? craftables.length === 2 : ((craftables[0] === 'non-craftable' && !isCraftable) || (craftables[0] === 'craftable' && isCraftable)));

          const isUsed = !!entry.usage && entry.usage.length > 0;
          const fitsUsage = (usage.length !== 1 ? usage.length === 2 : ((usage[0] === 'unused' && !isUsed) || (usage[0] === 'used' && isUsed)));

          return fitsName && fitsRarity && fitsExclusive && fitsItemType && fitsSphereType && fitsCraftable && fitsUsage;
        });
      }, [keys, filters, otherKeys, state.pageDb]);
      return result;
    },
  },
};

export default itemStore;
