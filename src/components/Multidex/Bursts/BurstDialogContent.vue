<template>
  <v-card flat>
    <v-card-text v-if="loadingBurstData" class="text-xs-center pt-5">
      <v-progress-circular indeterminate/>
      <h4 class="subheading">Loading burst data</h4>
    </v-card-text>
    <v-card-text v-else-if="!burst">
      No burst data found.
    </v-card-text>
    <v-card-text v-else class="pl-0 pr-0 pb-5">
      {{ burst }}
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapState } from 'vuex';
export default {
  props: ['burstId'],
  computed: {
    ...mapState('bursts', ['pageDb']),
  },
  data () {
    return {
      burst: undefined,
      loadingBurstData: true,
      // activeTab: 'skills',
    };
  },
  watch: {
    async burstId (newValue) {
      if (!newValue) {
        this.burst = undefined;
      } else {
        this.loadingBurstData = true;
        this.burst = await this.getBurst(newValue);
        this.loadingBurstData = false;
      }
    },
    async pageDb () {
      if (this.burstId && Object.keys(this.pageDb).length > 0) {
        this.loadingBurstData = true;
        this.burst = await this.getBurst(this.burstId);
        this.loadingBurstData = false;
      }
    },
  },
  async mounted () {
    if (this.burstId) {
      this.loadingBurstData = true;
      this.burst = await this.getBurst(this.burstId);
      this.loadingBurstData = false;
    }
  },
  methods: {
    ...mapActions('bursts', { getBurst: 'getById' }),
  },
};
</script>
