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
        <div class="body-1">
          <span>Seems like you haven't loaded the required data for this server yet.</span>
          <span v-if="toDownload.length > 0">({{ toDownload.map(d => dataSettingNameMapping[d]).join(', ') }})</span>
          <span v-else>You can load the missing data at the settings page.</span>
          <p class="body-1">
            (Once successfully downloaded, the data will be locally cached and will auto-load on future visits)
          </p>
        </div>
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
import { moduleInfo } from '@/store';

const multidexModules = moduleInfo.filter(m => m.type === 'multidex');
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
    ...(() => {
      // get state for each module
      let result = {};
      multidexModules.map(m => m.name).forEach(m => {
        const stateMapping = {};
        stateMapping[`${m}IsLoading`] = 'isLoading';
        stateMapping[`${m}CacheTimes`] = 'cacheTimes';
        stateMapping[`${m}NumEntries`] = 'numEntries';

        result = {
          ...result,
          ...mapState(m, stateMapping),
        };
      });
      return result;
    })(),
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
      const result = {};
      multidexModules.map(m => m.name)
        .forEach(m => {
          result[m] = {
            isLoading: this[`${m}IsLoading`],
            cacheTimes: this[`${m}CacheTimes`],
            numEntries: this[`${m}NumEntries`],
          };
        });
      return result;
    },
    dataSettingNameMapping () {
      const result = {};
      multidexModules.forEach(({ name, fullName }) => {
        result[name] = fullName;
      });
      return result;
    },
    dataIsLoading () {
      return Object.values(this.stateInfo).reduce((acc, val) => acc || val.isLoading, false);
    },
  },
  methods: {
    ...(() => {
      // get actions for each module
      let result = {};
      multidexModules.map(m => m.name).forEach(m => {
        const actionMapping = {};
        actionMapping[`${m}DataUpdate`] = 'updateData';
        // actionMapping[`${m}DataDelete`] = 'deleteData';
        result = {
          ...result,
          ...mapActions(m, actionMapping),
        };
      });
      return result;
    })(),
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
