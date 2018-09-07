<template>
  <v-container fluid grid-list-md>
    <v-layout row v-if="dataIsLoading">
      <v-flex>
        <loading-indicator :loading-message="loadingMessage"/>
      </v-flex>
    </v-layout>
    <v-layout row v-else-if="maxResults === 0 || toDownload.length > 0">
      <v-flex class="text-xs-center">
        <div class="body-1">
          <span v-text="downloadMessage"/>
          <p class="body-1">
            (Once successfully downloaded, the data will be locally cached and will auto-load on future visits)
          </p>
        </div>
        <v-btn v-if="toDownload.length > 0" @click="downloadData">Download Missing Data</v-btn>
        <v-btn v-else to="/settings">Go To Settings Page</v-btn>
      </v-flex>
    </v-layout>
    <v-layout row v-else-if="numResults === 0">
      <v-flex class="text-xs-center">
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
import { mapState } from 'vuex';
import { Logger } from '@/modules/Logger';
import LoadingIndicator from '@/components/LoadingIndicator';

export default {
  props: {
    dataIsLoading: {
      type: Boolean,
      default: false,
    },
    loadingMessage: {
      type: String,
      default: '',
    },
    requiredModules: {
      type: Array,
      default: () => []
    },
    stateInfo: {
      type: Object,
      default: () => [],
    },
    actionInfo: {
      type: Object,
      default: () => [],
    },
    maxResults: {
      type: Number,
      default: 0,
    },
    numResults: {
      type: Number,
      default: 0,
    },
    logger: {
      type: Logger,
      default: () => new Logger({ prefix: '[MD-RESULT-CONTAINER]' }),
    },
  },
  components: {
    LoadingIndicator,
  },
  computed: {
    ...mapState('settings', ['activeServer']),
    modulesAlreadyPresent () {
      return Object.keys(this.stateInfo)
        .filter(type => this.stateInfo[type].numEntries[this.activeServer] > 0);
    },
    toDownload () {
      return this.requiredModules.filter(({ name }) => !this.modulesAlreadyPresent.includes(name));
    },
    downloadMessage () {
      return [
        'Seems like you haven\'t loaded the required data for this server yet.',
        this.toDownload.length > 0
          ? `(${this.toDownload.map(entry => entry.fullName).join(', ')})`
          : 'You can load the missing data at the settings page.',
      ].join(' ');
    },
  },
  methods: {
    async downloadData () {
      this.logger.debug('starting download for', this.toDownload);
      for (const mdModule of this.toDownload) {
        try {
          await this.actionInfo[mdModule.name].update([this.activeServer]);
        } catch (err) {
          this.logger.error(mdModule.fullName, err);
        }
      }
    },
  },
};
</script>

