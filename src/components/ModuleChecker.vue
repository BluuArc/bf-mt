<template>
  <div style="height: 100%;">
    <v-slide-y-transition mode="out-in">
      <v-container
        v-if="isVisuallyInitializing || checkingAvailableModules || isExternallyLoading || ensuringDbSync"
        key="loadingMessage"
        fill-height
        justify-center>
        <v-layout column align-center justify-center v-if="isPostMount">
          <v-flex class="text-xs-center" style="flex-grow: 0;" v-if="checkingAvailableModules">
            <loading-indicator loadingMessage="Checking multidex module availability..."/>
          </v-flex>
          <v-flex class="text-xs-center" style="flex-grow: 0;" v-else-if="isVisuallyInitializing">
            <loading-indicator :loadingMessage="multidexLoadingMessage || mainLoadingMessage"/>
          </v-flex>
          <v-flex class="text-xs-center" style="flex-grow: 0;" v-else-if="ensuringDbSync">
            <loading-indicator :loadingMessage="multidexLoadingMessage || 'Synchronizing modules from DB to page'"/>
          </v-flex>
          <v-flex class="text-xs-center" style="flex-grow: 0;" v-else>
            <loading-indicator :loadingMessage="externalLoadingMessage"/>
          </v-flex>
        </v-layout>
      </v-container>
      <v-container
        v-else-if="missingModules.length > 0"
        key="missingModuleMessage"
        fill-height
        justify-center>
        <v-layout column align-center justify-center>
          <v-flex class="text-xs-center" style="flex-grow: 0;">
            <v-card>
              <v-card-text class="pb-0">
                <span class="d-block title py-2" v-html="missingModuleMessage"/>
                <span class="d-block subheading">
                  (Once successfully downloaded, the data will be locally cached and will auto-load on future visits)
                </span>
              </v-card-text>
              <v-card-actions class="py-1">
                <v-spacer/>
                <v-btn flat @click="downloadData">
                  Download Missing Data
                </v-btn>
                <v-spacer/>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
      <div v-else>
        <slot name="default"
          :activeServer="activeServer"
          :downloadData="downloadData"
          :hasUpdates="hasUpdates"
          :modulesWithUpdates="modulesWithUpdates"
          :switchServer="switchServer"
        >
          All modules loaded
        </slot>
        <module-update-dialog
          v-if="useUpdateDialog && hasUpdates"
          v-model="showUpdateDialog"
          :modulesWithUpdates="modulesWithUpdates"
          :downloadData="downloadData"/>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { makeMultidexTableInstance } from '@/modules/BfmtDatabase/client';
import { multidexModuleInfo, servers } from '@/modules/constants';
import { Logger } from '@/modules/Logger';
import LoadingDebouncer from '@/modules/LoadingDebouncer';
import LoadingIndicator from '@/components/LoadingIndicator';
import ModuleUpdateDialog from '@/components/ModuleUpdateDialog';

// specific table doesn't matter, as module check method is same for every instance
const client = makeMultidexTableInstance('units');
let loadingDebouncer;
export default {
  props: {
    requiredModules: {
      type: Array,
      default: () => [],
    },
    logger: {
      type: Logger,
      default: () => new Logger({ prefix: '[ModuleChecker]' }),
    },
    isExternallyLoading: {
      type: Boolean,
      default: false,
    },
    externalLoadingMessage: {
      type: String,
      default: '',
    },
    ensureDbSync: {
      type: Boolean,
      default: false,
    },
    useUpdateDialog: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    LoadingIndicator,
    ModuleUpdateDialog,
  },
  computed: {
    ...mapState('settings', ['activeServer']),
    ...mapState({
      inInitState: 'inInitState',
      isStateLoading: 'loadingState',
      mainLoadingMessage: 'mainLoadingMessage',
    }),
    multidexLoadingMessage () {
      const state = this.$store.state;
      const loadingModule = multidexModuleInfo.find(m => state[m.name] && state[m.name].loadingMessage);
      return loadingModule
        ? `[${loadingModule.fullName}] ${state[loadingModule.name].loadingMessage}`
        : '';
    },
    multidexModulesAreLoading () {
      const state = this.$store.state;
      const loadingModule = multidexModuleInfo.find(m => state[m.name] && state[m.name].isLoading);
      return loadingModule && state[loadingModule.name].isLoading;
    },
    isInternallyInitializing () {
      return this.inInitState ||
        this.isStateLoading ||
        this.multidexModulesAreLoading ||
        this.ensuringDbSync ||
        this.isSwitchingServers;
    },
    missingModuleNames () {
      return this.missingModules.map(m => {
        const singleModuleInfo = multidexModuleInfo.find(mod => mod.name === m);
        return singleModuleInfo ? singleModuleInfo.fullName : m;
      });
    },
    missingModuleMessage () {
      return [
        `Seems like you haven't loaded the required data for the ${this.activeServer.toUpperCase()} server yet.`,
        `(${this.missingModuleNames.join(', ')})`,
        'Click the button below to download the missing data.',
      ].join('<br>');
    },
    hasUpdates () {
      return this.modulesWithUpdates.length > 0;
    },
  },
  data () {
    return {
      missingModules: [],
      checkingAvailableModules: false,
      ensuringDbSync: false,
      isSwitchingServers: false,
      modulesWithUpdates: [],
      isVisuallyInitializing: true,
      isPostMount: false,
      showUpdateDialog: false,
    };
  },
  mounted () {
    // delay showing any loading messages to prevent brief flash of message
    setTimeout(() => {
      this.isPostMount = true;
    }, 25);
  },
  methods: {
    updateVisuallyInitializingFlag (valueGetter, immediatelySet) {
      loadingDebouncer.setValue(valueGetter, immediatelySet);
    },
    async checkAvailableModules () {
      if (this.requiredModules.length > 0) {
        this.checkingAvailableModules = true;
        const availableModules = await client.getTablesWithEntries(this.requiredModules, this.activeServer);
        this.missingModules = this.requiredModules.filter(m => !availableModules.includes(m));
        if (this.missingModules.length === 0) {
          this.checkDbSync();
        }
        this.checkingAvailableModules = false;
      }
    },
    async checkDbSync () {
      if (this.requiredModules.length > 0 && this.ensureDbSync) {
        this.ensuringDbSync = true;
        await this.updatePageDbs();
        this.ensuringDbSync = false;
      }
      this.onInitializationFinish();
    },
    async downloadData (inputModules) {
      const modulesToDownload = Array.isArray(inputModules) ? inputModules : this.missingModules;
      this.logger.debug('starting download for', modulesToDownload);
      for (const moduleName of modulesToDownload) {
        try {
          await this.$store.dispatch(`${moduleName}/updateData`, [this.activeServer]);
        } catch (err) {
          this.logger.error(moduleName, err);
        }
      }
      this.checkAvailableModules();
    },
    async checkForUpdates (inputModules) {
      const modulesToCheck = Array.isArray(inputModules) ? inputModules : this.requiredModules;
      this.modulesWithUpdates = await client.getTablesWithUpdates({
        tables: modulesToCheck,
        server: this.activeServer,
      });
    },
    async onInitializationFinish () {
      this.$emit('initfinished');
      await this.checkForUpdates();
    },
    async updatePageDbs () {
      await this.requiredModules.reduce((acc, name) => {
        return acc
          .then(() => this.$store.dispatch(`${name}/ensurePageDbSyncWithServer`, this.activeServer))
          .catch(this.logger.error);
      }, Promise.resolve());
    },
    async switchServer (server) {
      let newServer = server;
      if (!servers.includes(server)) {
        this.logger.warn(`unknown input server [${server}]. Auto rerouting to last known valid server`, this.activeServer);
        newServer = this.activeServer;
      }

      try {
        this.isSwitchingServers = true;
        await this.$nextTick();
        await this.$store.dispatch('setActiveServer', newServer);
      } catch (err) {
        this.logger.error(err);
      } finally {
        this.isSwitchingServers = false;
      }
    },
  },
  beforeCreate () {
    if (loadingDebouncer) {
      loadingDebouncer.dispose();
    }
    loadingDebouncer = new LoadingDebouncer(val => {
      this.isVisuallyInitializing = val;
    });
  },
  beforeDestroy () {
    if (loadingDebouncer) {
      loadingDebouncer.dispose();
    }
  },
  watch: {
    isInternallyInitializing: {
      immediate: true,
      handler () {
        this.updateVisuallyInitializingFlag(() => this.isInternallyInitializing);
      },
    },
    inInitState: {
      immediate: true,
      handler (isInitializing) {
        if (!isInitializing) {
          this.checkAvailableModules();
        }
      },
    },
    requiredModules () {
      if (!this.inInitState) {
        this.checkingAvailableModules();
      }
    },
    activeServer () {
      if (!this.inInitState) {
        this.checkAvailableModules();
      }
    },
    checkingAvailableModules () {
      this.updateVisuallyInitializingFlag(() => this.checkingAvailableModules, true);
    },
  },
};
</script>
