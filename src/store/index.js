import Vue from 'vue';
import Vuex from 'vuex';
import SettingsModule from './modules/settings';
import UnitsModule from './modules/units';
import ItemsModule from './modules/items';
import BurstModule from './modules/bursts';
import ExtraSkillModule from './modules/extra-skills';
import LeaderSkillModule from './modules/leader-skills';
import MissionModule from './modules/missions';
import downloadWorker from './instances/download-worker';

const statLogStart = (label, isCollapsed = true) => {
  console.time(label);
  if (isCollapsed) {
    console.groupCollapsed(label);
  } else {
    console.group(label);
  }
};
const statLogEnd = (label) => { console.timeEnd(label); console.groupEnd(); };

Vue.use(Vuex);
export const moduleInfo = [
  {
    name: 'settings',
    fullName: 'Settings',
    link: '/settings',
  },
  {
    name: 'units',
    fullName: 'Units',
    type: 'multidex',
    link: '/multidex/units',
  },
  {
    name: 'items',
    fullName: 'Items',
    type: 'multidex',
    link: '/multidex/items',
  },
  {
    name: 'bursts',
    fullName: 'Bursts',
    type: 'multidex',
    link: '/multidex/bursts',
  },
  {
    name: 'extraSkills',
    fullName: 'Extra Skills',
    type: 'multidex',
    link: '/multidex/extra-skills',
  },
  {
    name: 'leaderSkills',
    fullName: 'Leader Skills',
    type: 'multidex',
    link: '/multidex/leader-skills',
  },
  {
    name: 'missions',
    fullName: 'Missions',
    type: 'multidex',
    link: '/multidex/missions',
  },
];
export const modules = moduleInfo.map(m => m.name);
const store = new Vuex.Store({
  modules: {
    settings: SettingsModule,
    units: UnitsModule,
    items: ItemsModule,
    bursts: BurstModule,
    extraSkills: ExtraSkillModule,
    leaderSkills: LeaderSkillModule,
    missions: MissionModule,
  },
  state: {
    disableHtmlOverflow: false,
    inInitState: false,
    modules,
    sortAndFilterSettings: {},
    updateTimes: {},
    multidexModulesWithUpdates: {
      gl: [],
      eu: [],
      jp: [],
    },
  },
  mutations: {
    setHtmlOverflow (state, overflowState = false) {
      state.disableHtmlOverflow = !!overflowState;
    },
    setInitState (state, newState = false) {
      state.inInitState = !!newState;
    },
    setSortAndFilterSettings (state, { key, filter, sort }) {
      state.sortAndFilterSettings[key] = { filter, sort };
    },
    setUpdateTimes (state, newTimes = {}) {
      state.updateTimes = newTimes;
    },
    setMultidexModulesWithUpdates (state, { newUpdates = [], server = 'gl' }) {
      state.multidexModulesWithUpdates[server] = newUpdates.slice();
    },
  },
  actions: {
    async init ({ dispatch, state, commit }) {
      commit('setInitState', true);
      for (const m of modules.slice(1)) {
        commit(`${m}/setLoadState`, true);
      }

      statLogStart('overallInit', false);
      statLogStart('initOnly', false);
      for (const m of modules) {
        statLogStart(`init-${m}`);
        console.debug('initializing', m);
        await dispatch(`${m}/init`);
        if (m !== 'settings') {
          commit(`${m}/setLoadState`, true);
        }
        statLogEnd(`init-${m}`);
      }
      statLogEnd('initOnly');

      await dispatch('setActiveServer', state.settings.activeServer);
      statLogEnd('overallInit');
      commit('setInitState', false);
    },
    async setActiveServer ({ dispatch, commit }, server = 'gl') {
      for (const m of modules.slice(1)) {
        commit(`${m}/setLoadState`, true);
      }
      statLogStart('overallServerChange', false);
      for (const m of modules) {
        statLogStart(`serverChange-${m}`);
        try {
          await dispatch(`${m}/setActiveServer`, server);
        } catch (err) {
          console.error(err);
        } finally {
          if (m !== 'settings') {
            commit(`${m}/setLoadState`, false);
          }
        }
        statLogEnd(`serverChange-${m}`);
      }
      statLogEnd('overallServerChange');
    },
    async fetchUpdateTimes ({ commit, state }) {
      const url = `${location.origin}${location.pathname}static/bf-data/update-stats.json`;
      const data = await downloadWorker.postMessage('getJson', [url]);
      state.modules.forEach(m => {
        if (data[m]) {
          Object.keys(data[m]).forEach(server => {
            data[m][server] = new Date(data[m][server]);
          });
        }
      });
      console.debug('update data', data);
      commit('setUpdateTimes', data);
    },
  },
  strict: true,
});

export default store;
