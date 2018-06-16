<template>
  <v-container fluid>
    <v-layout row v-if="dataIsLoading">
      <v-flex xs12 class="text-xs-center pt-5">
        <v-progress-circular indeterminate/>
        <h4 class="subheading">Waiting for data to finish loading.</h4>
      </v-flex>
    </v-layout>
    <v-layout row v-else-if="maxResults === 0 || toDownload.length > 0">
      <v-flex xs12 class="text-xs-center">
        <p>
          <span>Seems like you haven't loaded the required data for this server yet.</span>
          <span v-if="toDownload.length > 0">({{ toDownload.map(d => dataSettingNameMapping[d]).join(', ') }})</span>
          <span v-else>You can load the missing data at the settings page.</span>
        </p>
        <v-btn v-if="toDownload.length > 0" @click="downloadData">Download Missing Data</v-btn>
        <v-btn v-else to="/settings">Go To Settings Page</v-btn>
      </v-flex>
    </v-layout>
    <v-layout row v-else-if="numResults === 0">
      <v-flex xs12 class="text-xs-center">
        <p>No results found with current search parameters.</p>
      </v-flex>
    </v-layout>
    <slot name="default" v-else>
      <v-layout row>
        Replace the default slot to show your results here.
      </v-layout>
    </slot>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  props: {
    numResults: {
      type: Number,
      default: 0,
    },
    maxResults: {
      type: Number,
      default: 0,
    },
    requiredModules: {
      type: Array,
      default: () => [],
    },
    serverType: {
      type: String,
      default: '',
    },
  },
  computed: {
    ...mapState('settings', ['activeServer']),
    ...mapState('units', {
      unitsNumEntries: 'numEntries',
      unitssLoading: 'isLoading',
      unitsCacheTimes: 'cacheTimes',
    }),
    ...mapState('items', {
      itemsNumEntries: 'numEntries',
      itemssLoading: 'isLoading',
      itemsCacheTimes: 'cacheTimes',
    }),
    ...mapState('bursts', {
      burstsNumEntries: 'numEntries',
      burstssLoading: 'isLoading',
      burstsCacheTimes: 'cacheTimes',
    }),
    ...mapState('extraSkills', {
      extraSkillsNumEntries: 'numEntries',
      extraSkillssLoading: 'isLoading',
      extraSkillsCacheTimes: 'cacheTimes',
    }),
    ...mapState('leaderSkills', {
      leaderSkillsNumEntries: 'numEntries',
      leaderSkillssLoading: 'isLoading',
      leaderSkillsCacheTimes: 'cacheTimes',
    }),
    actualServer () {
      return this.serverType || this.activeServer;
    },
    modulesAlreadyPresent () {
      return Object.keys(this.stateInfo)
        .filter(type => this.stateInfo[type].numEntries[this.actualServer] > 0);
    },
    toDownload () {
      return this.requiredModules.filter(m => !this.modulesAlreadyPresent.includes(m));
    },
    stateInfo () {
      const info = {};
      Object.keys(this.dataSettingNameMapping)
        .forEach(type => {
          info[type] = {
            numEntries: this[`${type}NumEntries`],
            isLoading: this[`${type}sLoading`],
            cacheTimes: this[`${type}CacheTimes`],
          };
        });
      return info;
    },
    dataSettingNameMapping () {
      return {
        units: 'Units',
        items: 'Items',
        bursts: 'Brave Bursts',
        extraSkills: 'Extra Skills',
        leaderSkills: 'Leader Skills',
      };
    },
    dataIsLoading () {
      return Object.values(this.stateInfo).reduce((acc, val) => acc || val.isLoading, false);
    },
  },
  methods: {
    ...mapActions('units', {
      unitsDataUpdate: 'updateData',
      unitsDataDelete: 'deleteData',
    }),
    ...mapActions('items', {
      itemsDataUpdate: 'updateData',
      itemsDataDelete: 'deleteData',
    }),
    ...mapActions('bursts', {
      burstsDataUpdate: 'updateData',
      burstsDataDelete: 'deleteData',
    }),
    ...mapActions('extraSkills', {
      extraSkillsDataUpdate: 'updateData',
      extraSkillsDataDelete: 'deleteData',
    }),
    ...mapActions('leaderSkills', {
      leaderSkillsDataUpdate: 'updateData',
      leaderSkillsDataDelete: 'deleteData',
    }),
    async downloadData () {
      console.debug('starting download for', this.toDownload);
      for (const type of this.toDownload) {
        try {
          await this[`${type}DataUpdate`]([this.actualServer]);
        } catch (err) {
          console.error(type, err);
        }
      }
    },
  },
};
</script>
