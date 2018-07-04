<template>
  <v-card raised class="github-commit-card">
    <v-card-title primary-title>
      <v-flex>
        <h3 class="headline">GitHub Commits</h3>
      </v-flex>
      <v-flex :class="{ 'text-xs-right': $vuetify.breakpoint.smAndUp }">
        <span :title="getFormattedDate(branches.master.updateTime).full">Updated {{ getFormattedDate(branches.master.updateTime).diff }}</span>
      </v-flex>
    </v-card-title>
    <v-card-text>
      <v-container fluid class="pt-0">
        <v-layout row wrap>
          <v-flex xs12 md6 v-for="(branch, name) in branches" :key="name">
            <h3 class="subheading"><b>{{ name }}</b></h3>
            <p class="body-1" v-text="branch.description"/>
            <v-container fluid class="pa-0">
              <v-layout row wrap v-for="item in branch.commits.slice(0, 10)" :key="item.sha">
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
                    <b>{{ item.author.login }}</b>
                    <span>committed</span>
                    <span style="white-space: nowrap;" :title="getFormattedDate(item.commit.author.data).full">{{ getFormattedDate(item.commit.author.date).diff }}</span>
                    <a style="white-space: nowrap; color: inherit;" target="_blank" rel="noopener" :href="item.html_url">({{ item.sha.slice(0, 8) }})</a>
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
import { mapState } from 'vuex';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
export default {
  computed: {
    ...mapState('settings', ['branches']),
  },
  methods: {
    getFormattedDate (inputDate) {
      const date = dayjs(inputDate);
      return {
        full: date.toDate().toLocaleString(),
        time: date.toDate().toLocaleTimeString(),
        date: date.toDate().toLocaleDateString(),
        diff: date.fromNow(),
      };
    },
  },
};
</script>

<style>
.github-commit-card .list__tile {
  padding-left: 0;
}
</style>
