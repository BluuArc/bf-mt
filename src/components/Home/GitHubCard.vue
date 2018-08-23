<template>
  <v-card raised id="github-commit-card">
    <v-card-title primary-title>
      <v-flex>
        <h1 class="title">GitHub Commits</h1>
      </v-flex>
      <v-flex :class="{ 'text-xs-right': $vuetify.breakpoint.smAndUp }">
        <span :title="getFormattedDate(branches.master.updateTime).full">Updated {{ getFormattedDate(branches.master.updateTime).diff }}</span>
      </v-flex>
    </v-card-title>
    <v-card-text>
      <v-container fluid class="pt-0">
        <v-layout row wrap>
          <v-flex xs12 md6 v-for="(branch, name) in branches" :key="name">
            <v-badge v-if="branchCounts[name] && branchCounts[name] > 0" left>
              <span slot="badge" v-text="branchCounts[name]"></span>
              <h2 class="subheading">
                <b>
                  <a :href="`https://github.com/BluuArc/bf-mt/commits/${name}`"
                    rel="noopener" target="_blank"
                    style="color: inherit;" v-text="name"/>
                </b>
                <v-icon small class="pl-1">fas fa-external-link-alt</v-icon>
              </h2>
            </v-badge>
            <h2 v-else class="subheading">
              <b>
                <a :href="`https://github.com/BluuArc/bf-mt/commits/${name}`"
                  rel="noopener" target="_blank"
                  style="color: inherit;" v-text="name"/>
              </b>
              <v-icon small class="pl-1">fas fa-external-link-alt</v-icon>
            </h2>
            <p class="body-1" v-text="branch.description"/>
            <v-container fluid class="pa-0">
              <v-layout row v-if="branch.commits.length === 0">
                <v-flex class="text-xs-center">
                  <h3 class="title">No commits found.</h3>
                </v-flex>
              </v-layout>
              <v-layout row v-for="item in branch.commits.slice(0,10)" :key="item.sha">
                <v-flex xs3 sm1 class="center-align-parent">
                  <div class="center-align-container">
                    <v-avatar size="36px">
                      <img :src="item.author.avatar_url">
                    </v-avatar>
                  </div>
                </v-flex>
                <v-flex xs9 sm11>
                  <p class="body-2 mb-0" v-text="item.commit.message"/>
                  <p class="body-1 mb-0">
                    <span v-html="`<b>${item.author.login}</b> committed`"/>
                    <span
                      style="white-space: nowrap;"
                      :title="getFormattedDate(item.commit.author.date).full">
                      {{ getFormattedDate(item.commit.author.date).diff }}
                    </span>
                    <a
                      style="white-space: nowrap; color: inherit;"
                      target="_blank" rel="noopener"
                      :href="item.html_url" v-text="item.sha.slice(0, 8)"/>
                  </p>
                </v-flex>
              </v-layout>
            </v-container>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { getFormattedDate } from '@/modules/utils';

export default {
  computed: {
    ...mapState('github', ['lastSeenTime', 'branches']),
    ...mapGetters('github', ['getNumberOfNewCommits']),
  },
  data () {
    return {
      branchCounts: {},
    };
  },
  methods: {
    getFormattedDate,
    updateCommitCount () {
      Object.keys(this.branches).forEach(branch => {
        this.branchCounts[branch] = this.getNumberOfNewCommits([branch]);
      });
    },
  },
  watch: {
    branches: {
      deep: true,
      handler () {
        this.updateCommitCount();
      },
    },
    lastSeenTime () {
      this.updateCommitCount();
    },
  },
  mounted () {
    this.updateCommitCount();
  },
};
</script>
