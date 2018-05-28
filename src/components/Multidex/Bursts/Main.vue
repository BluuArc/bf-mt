<template>
  <v-container grid-list-sm class="pb-5">
    <v-layout row v-if="isLoading">
      <v-flex xs12 class="text-xs-center pt-5">
        <v-progress-circular indeterminate/>
        <h4 class="subheading">Waiting for data to finish loading.</h4>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-else>
      <v-flex xs12 class="text-xs-center">
        <h1 class="title">Bursts Page Coming Soon</h1>
        {{ burstId }}
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import debounce from 'lodash/debounce';

export default {
  props: ['query', 'burstId'],
  computed: {
    ...mapState('bursts', ['pageDb', 'isLoading']),
  },
  watch: {
    isLoading (newValue) {
      if (!newValue) {
        this.initDb();
      }
    },
  },
  created () {
    if (!this.isLoading) {
      this.initDb();
    }
  },
  methods: {
    ...mapActions('bursts', ['getFilteredKeys', 'ensurePageDbSyncWithServer']),
    initDb: debounce(function () {
      this.ensurePageDbSyncWithServer();
    }, 50),
  },
};
</script>
