import { missionWorker } from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import { createState, createMutations, createActions, createGetters } from './db.common';
import SWorker from '../../assets/sww.min';
import union from 'lodash/union';

const missionStore = {
  namespaced: true,
  state: {
    ...createState(),
    possibleValues: {
      land: [],
      area: [],
      dungeon: [],
    },
  },
  mutations: {
    ...createMutations(),
    setPossibleValues (state, values = { land: [], area: [], dungeon: [] }) {
      state.possibleValues = values;
    },
  },
  getters: {
    ...createGetters('missions'),
    missionById: state => id => state.pageDb[id],
  },
  actions: {
    ...createActions(missionWorker, downloadWorker, 'missions'),
    async updatePossibleValues ({ commit, state }) {
      commit('setLoadingMessage', 'Getting land, area, and dungeon values for missions');
      const result = await SWorker.run((keys, pageDb) => {
        const possible = { land: [], area: [], dungeon: [] };
        const locationTypes = ['land', 'area', 'dungeon'];
        const addUnique = (arr = [], val = '') => {
          if (!arr.includes(val)) {
            arr.push(val);
          }
        };

        keys.forEach(missionKey => {
          const mission = pageDb[missionKey];
          locationTypes.forEach(locationType => {
            addUnique(possible[locationType], mission[locationType]);
          });
        });
        return possible;
      }, [Object.keys(state.pageDb).sort((a, b) => +a - +b), state.pageDb]);
      commit('setPossibleValues', result);
    },
    async ensurePageDbSyncWithServer ({ commit, dispatch, state }) {
      if (state.pageDb[state.activeServerSymbol] !== state.activeServer) {
        commit('setLoadState', { loadState: true, message: 'Getting data for active server' });
        const data = await dispatch('getMiniDb', state.activeServer);
        commit('setActiveServer', { server: state.activeServer, data });
        await dispatch('updatePossibleValues');
        commit('setLoadState', false);
      }
    },
    async updateData ({ commit, dispatch }, servers = []) {
      commit('setLoadState', true);
      const baseUrl = `${location.origin}${location.pathname}static/bf-data`;
      for (const server of servers) {
        const logPrefix = `Downloading data for ${server.toUpperCase()} server`;
        commit('setLoadingMessage', logPrefix);
        try {
          const missionDb = await downloadWorker.postMessage('getJson', [`${baseUrl}/missions-${server}.json`]);
          commit('setLoadingMessage', `Storing data for ${server.toUpperCase()} server`);
          await dispatch('saveData', { data: missionDb, server });
          console.debug('finished updating mission data for', server);
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
        const serverKeys = await Promise.all(servers.map(server => missionWorker.getFieldKeys({ server }, 'data')));
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
        const fitsTernary = (entryIsTrue = false, filterValue = [], { trueVal = 'true', falseVal = 'false' }) => {
          return (filterValue.length !== 1
            ? filterValue.length === 2 // all or none
            : ((filterValue[0] === trueVal && entryIsTrue) || (filterValue[0] === falseVal && !entryIsTrue)) // entry is true matches filter
          );
        };
        const { name = '', exclusives = [], associatedUnits = [], associatedItems = [], gems = [], continues = [] } = filters;
        /*, difficulty = [], hasMimics = [], hasRequirements = [] */
        return keys.filter(key => {
          const entry = pageDb[key];
          const fitsName = (!name ? true : entry.name.toLowerCase().includes(name.toLowerCase()));

          const isExclusive = !otherKeys.includes((entry.id || '').toString());
          const fitsExclusive = fitsTernary(isExclusive, exclusives, { trueVal: 'exclusive', falseVal: 'non-exclusive' });

          const hasAssociatedUnits = Array.isArray(entry.clear_bonus) && entry.clear_bonus.filter(bonus => !!bonus.unit).length > 0;
          const fitsAssociatedUnits = fitsTernary(hasAssociatedUnits, associatedUnits, { trueVal: 'with', falseVal: 'without' });

          const hasAssociatedItems = Array.isArray(entry.clear_bonus) && entry.clear_bonus.filter(bonus => !!bonus.item).length > 0;
          const fitsAssociatedItems = fitsTernary(hasAssociatedItems, associatedItems, { trueVal: 'with', falseVal: 'without' });

          const hasGems = Array.isArray(entry.clear_bonus) && entry.clear_bonus.filter(bonus => !!bonus.gem).length > 0;
          const fitsGemFilter = fitsTernary(hasGems, gems, { trueVal: 'with', falseVal: 'without' });

          const hasContinues = !!entry.continue;
          const fitsContinueFilter = fitsTernary(hasContinues, continues, { trueVal: 'with', falseVal: 'without' });

          const fitsLocationFilters = ['land', 'area', 'dungeon'].map(locationType => {
            const locationFilters = filters[locationType] || [];
            return locationFilters.length === 0 || locationFilters.includes(entry[locationType]);
          }).reduce((acc, val) => acc && val, true);

          // const doesHaveMimics = entry.mimic_info && Object.keys(entry.mimic_info).length > 0;
          // const fitsMimicFilter = fitsTernary(doesHaveMimics, hasMimics, { trueVal: 'with', falseVal: 'without' });
          return [fitsName, fitsExclusive, fitsAssociatedUnits, fitsAssociatedItems, fitsGemFilter, fitsContinueFilter, fitsLocationFilters].reduce((acc, val) => acc && val, true);
        });
      }, [keys, filters, otherKeys, state.pageDb]);
      return result;
    },
  },
};

export default missionStore;
