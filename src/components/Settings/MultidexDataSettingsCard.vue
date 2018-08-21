<template>
  <multidex-data-wrapper>
    <generic-settings-card
      slot-scope="{ stateInfo, actionInfo }"
      :disable-submission="!formHasChanged"
      :form-reset="resetForm">
      <v-layout slot="title">
        <v-flex class="pb-0 d-align-self-center" xs12 sm6 md8 lg9>
          <h1 class="title">Multidex Data Settings</h1>
        </v-flex>
        <v-flex class="pb-0" xs12 sm6 md4 lg3>
          <v-btn block :loading="checkingForUpdates" @click="checkForUpdates">Check for updates</v-btn>
        </v-flex>
      </v-layout>
      <v-container fluid class="pa-0" slot="body" style="min-width: 570px;">
        <v-layout row>
          <v-flex xs3 class="text-xs-center subheading font-weight-bold d-align-self-center">
            Data Type
          </v-flex>
          <v-flex
            xs3 class="text-xs-center subheading font-weight-bold"
            v-for="server in servers" :key="server">
            <dual-row-cell>
              <v-flex slot="top" v-text="server.toUpperCase()"/>
              <template slot="bottom">
                <v-flex xs12 md6>
                  <v-btn
                    block
                    @click="toggleAllModuleReload(server, true)"
                    :disabled="dataIsLoading">
                    Reload All
                  </v-btn>
                </v-flex>
                <v-flex xs12 md6>
                  <v-btn
                    block
                    @click="toggleAllModuleDelete(server, true)"
                    :disabled="dataIsLoading">
                    Delete All
                  </v-btn>
                </v-flex>
              </template>
            </dual-row-cell>
          </v-flex>
        </v-layout>
        <v-layout row v-for="mod in multidexModules" :key="mod.name">
          <v-flex xs3>
            <dual-row-cell>
              <v-flex slot="top" class="text-xs-center subheading font-weight-medium" v-text="mod.fullName"/>
              <template slot="bottom">
                <v-flex xs12 md6>
                  <v-btn
                    block
                    @click="toggleAllServerReload(mod.name, true)"
                    :disabled="dataIsLoading">
                    Reload All
                  </v-btn>
                </v-flex>
                <v-flex xs12 md6>
                  <v-btn
                    block
                    @click="toggleAllServerDelete(mod.name, true)"
                    :disabled="dataIsLoading">
                    Delete All
                  </v-btn>
                </v-flex>
              </template>
            </dual-row-cell>
          </v-flex>
          <v-flex
            v-show="!(stateInfo[mod.name] && stateInfo[mod.name].isLoading)"
            xs3 v-for="server in servers" :key="`${mod.name}-${server}`">
            <dual-row-cell>
              <v-flex slot="top" class="text-xs-center">
                <span v-if="stateInfo[mod.name].numEntries[server] > 0">
                  <b>Cached:</b><br>{{ new Date(stateInfo[mod.name].cacheTimes[server]).toLocaleString() }}
                </span>
                <span v-else>
                  No data cached.
                </span>
                <p v-if="stateInfo[mod.name].hasUpdates[server]">
                  <v-alert color="info" class="pt-2 pb-2 pl-2 pr-2" :value="true">
                    <span class="d-block">Update available</span>
                    <span class="d-block">({{ new Date(stateInfo[mod.name].hasUpdates[server]).toLocaleString() }})</span>
                  </v-alert>
                </p>
              </v-flex>
              <template slot="bottom">
                <v-flex xs12 md6>
                  <v-btn block
                    :disabled="dataIsLoading"
                    :outline="!dataUpdate[mod.name].includes(server)"
                    @click="toggleDataUpdate(mod.name, server)">
                    <v-icon>cloud_download</v-icon>
                  </v-btn>
                </v-flex>
                <v-flex xs12 md6>
                  <v-btn block
                    :disabled="dataIsLoading"
                    :outline="!dataDelete[mod.name].includes(server)"
                    @click="toggleDataDelete(mod.name, server)">
                    <v-icon>cloud_off</v-icon>
                  </v-btn>
                </v-flex>
              </template>
            </dual-row-cell>
          </v-flex>
        </v-layout>
      </v-container>
    </generic-settings-card>
  </multidex-data-wrapper>
</template>

<script>
/* eslint-disable no-unused-vars */
import { mapActions, mapState } from 'vuex';
import { Logger } from '@/modules/logger';
import { servers } from '@/modules/constants';
import { moduleInfo } from '@/store';
import GenericSettingsCard from './GenericSettingsCard';
import DualRowCell from './DualRowCell';
import MultidexDataWrapper from '@/components/MultidexDataWrapper';

const logger = new Logger({ prefix: '[MULTIDEX-DATA-SETTINGS]' });

const multidexModules = moduleInfo.filter(m => m.type === 'multidex');
export default {
  components: {
    GenericSettingsCard,
    DualRowCell,
    MultidexDataWrapper,
  },
  computed: {
    multidexModules: () => multidexModules,
    formHasChanged () {
      logger.warn('using mock form has changed');
      return false;
    },
    servers: () => servers,
    dataIsLoading () {
      logger.warn('using mock data is loading');
      return false;
    },
  },
  data () {
    const dataUpdate = {};
    const dataDelete = {};
    multidexModules.forEach(({ name }) => {
      // each entry contains array of servers to re-download
      dataUpdate[name] = [];
      dataDelete[name] = [];
    });
    return {
      dataUpdate,
      dataDelete,
      checkingForUpdates: false,
    };
  },
  methods: {
    ...mapActions(['fetchUpdateTimes']),
    async checkForUpdates () {
      this.checkingForUpdates = true;
      await this.fetchUpdateTimes();
      this.checkingForUpdates = false;
    },
    toggleDataUpdate (moduleName, server, forcedValue) {
      const hasServer = this.dataUpdate[moduleName].includes(server);
      if (hasServer && (forcedValue === false || forcedValue === undefined)) {
        this.dataUpdate[moduleName] = this.dataUpdate[moduleName].filter(s => s !== server);
      } else {
        if (!hasServer) {
          this.dataUpdate[moduleName].push(server);
        }
        // remove from delete list
        if (this.dataDelete[moduleName].includes(server)) {
          this.dataDelete[moduleName] = this.dataDelete[moduleName].filter(s => s !== server);
        }
      }
    },
    toggleDataDelete (moduleName, server, forcedValue) {
      const hasServer = this.dataDelete[moduleName].includes(server);
      if (hasServer && (forcedValue === false || forcedValue === undefined)) {
        this.dataDelete[moduleName] = this.dataDelete[moduleName].filter(s => s !== server);
      } else {
        if (!hasServer) {
          this.dataDelete[moduleName].push(server);
        }
        // remove from update list
        if (this.dataUpdate[moduleName].includes(server)) {
          this.dataUpdate[moduleName] = this.dataUpdate[moduleName].filter(s => s !== server);
        }
      }
    },
    toggleAllModuleReload(server, value) {
      multidexModules.forEach(({ name }) => this.toggleDataUpdate(name, server, !!value));
    },
    toggleAllModuleDelete(server, value) {
      multidexModules.forEach(({ name }) => this.toggleDataDelete(name, server, !!value));
    },
    toggleAllServerReload(moduleName, value) {
      servers.forEach(server => this.toggleDataUpdate(moduleName, server, !!value));
    },
    toggleAllServerDelete(moduleName, value) {
      servers.forEach(server => this.toggleDataDelete(moduleName, server, !!value));
    },
    resetForm () {
      multidexModules.forEach(({ name }) => {
        this.dataUpdate[name] = [];
        this.dataDelete[name] = [];
      });
    },
  },
  watch: {
    // lightMode () {
    //   this.syncCacheToPage();
    // },
    // activeServer () {
    //   this.syncCacheToPage();
    // },
  },
  mounted () {
    // logger.debug('ready');
  },
};
</script>

<style scoped>
.v-input--radio-group .v-radio {
  flex: 1;
}
</style>
