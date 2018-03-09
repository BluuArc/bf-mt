import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const storeGetters = {};

export const storeMutations = {
  setUnitData: (state, options) => {
    const { data, server } = options;
    if (!state.unitData) {
      state.unitData = {};
    }
    state.unitData[server] = data;
  },
  setItemData: (state, options) => {
    const { data, server } = options;
    if (!state.itemData) {
      state.itemData = {};
    }
    state.itemData[server] = data;
  },
  setBraveBurstData: (state, options) => {
    const { data, server } = options;
    if (!state.burstData) {
      state.burstData = {};
    }
    state.burstData[server] = data;
  },
  setExtraSkillData: (state, options) => {
    const { data, server } = options;
    if (!state.extraSkillData) {
      state.extraSkillData = {};
    }
    state.extraSkillData[server] = data;
  },
  setActiveServers: (state, servers) => {
    state.activeServers = servers;
  },
  setCurrentServer: (state, current) => {
    state.currentServer = current;
  },
};

export default new Vuex.Store({
  state: {
    unitData: undefined,
    itemData: undefined,
    burstData: undefined,
    extraSkillData: undefined,
    currentServer: 'gl',
    activeServers: ['gl', 'jp', 'eu'],
  },
  getters: storeGetters,
  mutations: storeMutations,
});

/* eslint-disable */
export const storeMethods = {
  unitDataLoaded: state => state.unitData && Object.keys(state.unitData).length > 0,
  itemDataLoaded: state => state.itemData && Object.keys(state.itemData).length > 0,
  burstDataLoaded: state => state.burstData && Object.keys(state.burstData).length > 0,
  extraSkillDataLoaded: state => state.extraSkillData && Object.keys(state.extraSkillData).length > 0,
  getUnit: (state, id, server = state.currentServer) => state.unitData[server][id],
  getUnitImageURLs: (state, id, server = state.currentServer) => {
    const cdnUrls = {
      eu: 'http://static-bravefrontier.gumi-europe.net/content/',
      gl: 'http://dlc.bfglobal.gumi.sg/content/',
      jp: 'http://cdn.android.brave.a-lim.jp/',
    };

    const baseUrl = `${cdnUrls[server]}/unit/img`;

    return {
      ills_full: `${baseUrl}/unit_ills_full_${id}.png`,
      ills_thum: `${baseUrl}/unit_ills_thum_${id}.png`,
      anime: `${baseUrl}/unit_thum_${id}.png`,
      ills_battle: `${baseUrl}/unit_ills_battle_${id}.png`,
    };
  },
};
