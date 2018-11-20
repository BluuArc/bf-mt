import { Logger } from '@/modules/Logger';
import { makeWorker } from './instances/dexie-client';
import downloadWorker from './instances/download-worker';
import CacheSingleton from '@/modules/CacheSingleton';

const commitsDb = makeWorker('commits');
const commitUrl = 'https://api.github.com/repos/BluuArc/bf-mt/commits';
const logger = new Logger({ prefix: '[STORE/GH-COMMITS]' });
const defaultDate = new Date('May 21, 2018');
const branchesToTrack = Object.freeze(['master', 'gh-pages']);

const branchCaches = (() => {
  function getCommitsForBranch (branch, startDate = defaultDate) {
    return downloadWorker.postMessage('getJson', [`${commitUrl}?sha=${branch}&since=${new Date(startDate).toISOString()}`]);
  }
  const caches = {};
  branchesToTrack.forEach(branch => {
    caches[branch] = new CacheSingleton({
      loggerOptions: {
        prefix: `[GH-CACHE:${branch}]`,
      },
      async getter(logger, startDate) {
        const commits = await getCommitsForBranch(branch, startDate);
        logger.debug('new commits', commits);
        return commits;
      },
      defaultValue: [],
    });
  });
  return caches;
})();

export default {
  namespaced: true,
  state: {
    lastSeenTime: defaultDate,
    countCache : {},
    branches: {
      master: {
        startDate: defaultDate,
        commits: [],
        updateTime: defaultDate,
        description: 'Branch for the development version of the tool. The uncompiled source code can be found in this branch.',
      },
      'gh-pages': {
        startDate: new Date('June 16, 2018'),
        commits: [],
        updateTime: defaultDate,
        description: 'Branch for the public version of the tool. This is the version that most users will see when accessing the page.',
      },
    },
  },
  mutations: {
    setCommits (state, { branch, commits = [], updateTime = defaultDate }) {
      if (!state.branches[branch]) {
        throw Error(`Invalid branch: ${branch}`);
      }
      logger.debug('set commits', branch, commits, updateTime);
      state.branches[branch].commits = commits;
      state.branches[branch].updateTime = updateTime;

      Object.keys(state.branches).forEach(branchName => {
        const branch = state.branches[branchName];
        const dates = branch.commits.map(entry => new Date(entry.commit.author.date));
        state.countCache[branchName] = dates.filter(date => date > new Date(state.lastSeenTime)).length;
      });
    },
    setLastSeenTime (state, newTime = new Date()) {
      state.lastSeenTime = newTime;

      Object.keys(state.branches).forEach(branchName => {
        const branch = state.branches[branchName];
        const dates = branch.commits.map(entry => new Date(entry.commit.author.date));
        state.countCache[branchName] = dates.filter(date => date > new Date(state.lastSeenTime)).length;
      });
    },
  },
  getters: {
    getBranchNames: state => Object.keys(state.branches),
    getNumberOfNewCommits: state => (branches = Object.keys(state.branches)) => {
      const count = branches.map(branchName => state.countCache[branchName] || 0).reduce((acc, val) => acc + val, 0);
      // logger.debug('num new commits for', branches, count);
      return count;
    },
  },
  actions: {
    async getCachedState () {
      return commitsDb.get({ user: commitUrl })
        .then(results => results.length === 0 ? {} : results[0].data);
    },
    async saveCurrentState ({ state, dispatch }) {
      const cachedState = await dispatch('getCachedState');
      await dispatch('putState', {
        ...cachedState,
        ...state,
      });
    },
    putState (stateHelpers, data) { // eslint-disable-line no-unused-vars
      return commitsDb.put({ user: commitUrl, data });
    },
    async init ({ dispatch, commit, state }) {
      const cachedData = await dispatch('getCachedState');
      const { branches = {}, lastSeenTime } = cachedData;
      for (const branch in state.branches) {
        const branchInfo = branches[branch] || {};
        commit('setCommits',
          {
            branch,
            commits: branchInfo.commits,
            updateTime: branchInfo.updateTime,
          });
        branchCaches[branch].setValue(state.branches[branch].commits, state.branches[branch].updateTime);
      }
      commit('setLastSeenTime', lastSeenTime);
      await dispatch('saveCurrentState');

      const hasMissingCommits = Object.values(state.branches).some(({ commits }) => commits.length === 0);
      if (hasMissingCommits) {
        await dispatch('updateCommits');
      }
    },
    async setCommits ({ commit, dispatch }, { branch, commits = [], updateTime = defaultDate }) {
      const cachedState = await dispatch('getCachedState');
      logger.debug('setting commits for', branch, commits, new Date(updateTime).toISOString());
      await dispatch('putState', {
        lastSeenTime: cachedState.lastSeenTime,
        branches: {
          ...cachedState.branches,
          [branch]: {
            ...(cachedState.branches[branch] || {}),
            commits,
            updateTime: new Date(updateTime).toISOString(),
          }
        }
      });
      commit('setCommits', { branch, commits, updateTime });
    },
    async setLastSeenTime ({ commit, dispatch }, newTime = defaultDate) {
      const cachedState = await dispatch('getCachedState');
      logger.debug('setting last seen time to', new Date(newTime).toISOString());
      await dispatch('putState', {
        ...cachedState,
        lastSeenTime: newTime,
      });
      commit('setLastSeenTime', newTime);
    },
    async updateCommits ({ dispatch, state, commit }) {
      let gotNewCommits = false;
      for (const branch of branchesToTrack) {
        if (!branchCaches[branch].isStale) {
          logger.debug('skipping branch update', branch);
          continue;
        }
        try {
          const commits = await branchCaches[branch].getValue(false, new Date(state.branches[branch].startDate).toISOString());
          commit('setCommits', { branch, commits, updateTime: new Date() });
          gotNewCommits = true;
        } catch (err) {
          logger.error(err);
        }
      }
  
      if (gotNewCommits) {
        await dispatch('saveCurrentState');
      }
    },
  },
};
