import dbWorker from '../instances/dexie-client';
import downloadWorker from '../instances/download-worker';
import dayjs from 'dayjs';
const settingsDb = dbWorker.setTable('settings');

const fiveMinutes = 1000 * 60 * 5;
function timeDifferenceIsLessThanFiveMinutes (dateToCompare = new Date()) {
  return (new Date() - new Date(dateToCompare)) < fiveMinutes;
}

function calculateNumberOfNewCommits (branches, lastSeenTime = new Date()) {
  return Object.values(branches)
    .map(branch => {
      const dates = branch.commits.map(entry => new Date(entry.commit.author.date));
      return dates.filter(date => date > new Date(lastSeenTime)).length;
    }).reduce((acc, val) => acc + val, 0);
}

// user entry for dexie db
const user = 'me';

const settingsStore = {
  namespaced: true,
  state: {
    lightMode: false,
    activeServer: 'gl',
    commitUrl: 'https://api.github.com/repos/BluuArc/bf-mt/commits',
    numNewCommits: 0,
    lastSeenTime: new Date('May 21, 2018'),
    branches: {
      master: {
        startDate: new Date('May 21, 2018'),
        commits: [],
        updateTime: new Date('May 21, 2018'),
        description: 'Branch for the development version of the tool. The uncompiled source code can be found in this branch.',
      },
      'gh-pages': {
        startDate: new Date('June 16, 2018'),
        commits: [],
        updateTime: new Date('May 21, 2018'),
        description: 'Branch for the public version of the tool. This is the version that most users will see when accessing the page.',
      },
    },
  },
  mutations: {
    setLightMode (state, mode) {
      state.lightMode = !!mode;
    },
    setActiveServer (state, server = 'gl') {
      state.activeServer = server;
    },
    setCommits (state, { branch, commits = [], updateTime = new Date('May 21, 2018') }) {
      if (!state.branches[branch]) {
        throw Error(`Invalid branch: ${branch}`);
      }
      console.debug('set commits', branch, commits, updateTime);
      state.branches[branch].commits = commits;
      state.branches[branch].updateTime = updateTime;

      state.numNewCommits = calculateNumberOfNewCommits(state.branches, new Date(state.lastSeenTime));
    },
    updateNewCommitCount (state) {
      state.numNewCommits = calculateNumberOfNewCommits(state.branches, new Date(state.lastSeenTime));
    },
    setLastSeenTime (state, newTime = new Date()) {
      state.lastSeenTime = newTime;
      state.numNewCommits = calculateNumberOfNewCommits(state.branches, new Date(state.lastSeenTime));
    },
  },
  getters: {
    getBranchNames: state => Object.keys(state.branches),
  },
  actions: {
    // load settings from cache
    async init ({ dispatch, state }) {
      const currentSettings = await dispatch('getCurrentSettings');
      const { commits = {} } = currentSettings;
      console.debug(currentSettings);
      await dispatch('setLightMode', currentSettings.lightMode);
      await dispatch('setActiveServer', currentSettings.activeServer);
      for (const branch in state.branches) {
        await dispatch('setCommitsForBranch', { branch, newCommits: (commits[branch] || {}).commits, updateTime: (commits[branch] || {}).updateTime });
      }
      await dispatch('setLastSeenTime', currentSettings.lastSeenTime);
    },
    async setLastSeenTime ({ commit, dispatch }, newTime = new Date('May 21, 2018')) {
      const data = await dispatch('getCurrentSettings');
      console.debug('current settings:', data, 'new commit seen time:', newTime);
      await settingsDb.put({
        user,
        data: {
          ...data,
          lastSeenTime: newTime,
        },
      });
      commit('setLastSeenTime', newTime);
    },
    async setLightMode ({ commit, dispatch }, mode) {
      const data = await dispatch('getCurrentSettings');
      console.debug('current settings:', data, 'new mode:', mode);
      await settingsDb.put(
        {
          user,
          data: {
            ...data,
            lightMode: !!mode,
          },
        }
      );
      commit('setLightMode', mode);
    },
    async setActiveServer ({ commit, dispatch }, server = 'gl') {
      if (!['gl', 'eu', 'jp'].includes(server)) {
        throw Error(`Invalid server "${server}"`);
      }

      const data = await dispatch('getCurrentSettings');
      console.debug('current settings:', data, 'new server:', server);
      await settingsDb.put({
        user,
        data: {
          ...data,
          activeServer: server,
        },
      });
      commit('setActiveServer', server);
    },
    getCurrentSettings () {
      return settingsDb.get({ user })
        .then(results => {
          return results.length === 0 ? {} : results[0].data;
        });
    },
    async setCommitsForBranch ({ commit, dispatch, state }, { branch, newCommits = [], updateTime = new Date('May 21, 2018') }) {
      if (!state.branches[branch]) {
        throw Error(`Invalid branch: ${branch}`);
      }

      const data = await dispatch('getCurrentSettings');
      const { commits = {} } = data;
      console.debug('current settings:', data, 'new commits:', branch, newCommits);
      await settingsDb.put({
        user,
        data: {
          ...data,
          commits: {
            ...commits,
            [branch]: {
              updateTime: new Date(updateTime).toISOString(),
              commits: newCommits,
            },
          },
        },
      });
      commit('setCommits', { branch, commits: newCommits, updateTime });
      commit('updateNewCommitCount');
    },
    async updateCommitsForBranch ({ dispatch, state }, branch) {
      if (!state.branches[branch]) {
        throw Error(`Invalid branch: ${branch}`);
      }

      console.debug('getting commits for branch', branch);
      if (state.branches[branch].commits.length > 0 && timeDifferenceIsLessThanFiveMinutes(state.branches[branch].updateTime)) {
        console.warn(`Please wait ${(60 * 5) - dayjs().diff(dayjs(state.branches[branch].updateTime), 'seconds')} seconds before updating.`);
        return;
      }

      try {
        const newCommits = await downloadWorker.postMessage('getJson', [`${state.commitUrl}?sha=${branch}&since=${state.branches[branch].startDate.toISOString()}`]);
        console.debug('got commits for branch', branch, newCommits.length);
        await dispatch('setCommitsForBranch', { branch, newCommits, updateTime: new Date() });
      } catch (err) {
        console.error('error getting data for', branch, err);
      }
    },
    async updateCommitsForAllBranches ({ state, dispatch }) {
      for (const branch in state.branches) {
        await dispatch('updateCommitsForBranch', branch);
      }
    },
  },
};

export default settingsStore;
