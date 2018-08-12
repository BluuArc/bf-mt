<template>
    <v-container grid-list-lg>
      <v-layout row>
        <v-flex xs12>
          <v-form ref="general-settings" id="general-settings">
            <v-card raised>
              <v-card-title>
                <h3 class="title">General Settings</h3>
              </v-card-title>
              <v-card-text>
                <v-switch v-model="general.lightMode" label="Use Light Theme"/>
              </v-card-text>
              <v-card-text>
                <h3 class="subheading">Active Server</h3>
                <v-radio-group v-model="general.activeServer" row>
                  <v-radio
                    v-for="server in servers"
                    :key="server"
                    :label="server.toUpperCase()"
                    :value="server"/>
                </v-radio-group>
              </v-card-text>
              <v-card-actions>
                <v-btn :disabled="!generalFormHasChanged" flat @click="generalFormSubmit">Apply Changes</v-btn>
                <v-btn flat @click="generalFormReset">Cancel</v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs12>
          <v-card raised>
            <v-card-title>
              <v-container fluid class="pa-0">
                <v-layout row wrap>
                  <v-flex class="pb-0" xs12 sm6 md8 lg9>
                    <h3 class="title">Data Settings</h3>
                  </v-flex>
                  <v-flex class="pb-0" xs12 sm6 md4 lg3>
                    <v-btn block :loading="checkingForUpdates" @click="checkForUpdates">Check for updates</v-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-title>
            <!-- <v-card-text v-if="dataIsLoading" class="text-xs-center">
              <v-progress-circular indeterminate/>
              <h4 class="subheading">Waiting for data to finish loading.</h4>
            </v-card-text> -->
            <v-card-text class="pt-5" style="overflow-x: auto;">
              <v-container fluid class="pa-0" style="min-width: 570px;">
                <v-layout row>
                  <v-flex
                    xs3
                    class="text-xs-center subheading pa-0"
                    style="font-weight: bold; border-right: var(--border-color) 1px solid;">Data Type</v-flex>
                  <v-flex
                    xs3 class="text-xs-center subheading pa-0" style="font-weight: bold"
                    v-for="server in servers"
                    :key="server">
                    <v-container fluid class="pt-0 pb-0">
                      <v-layout row>
                        <v-flex xs12 v-text="server.toUpperCase()"/>
                      </v-layout>
                    <v-layout row wrap>
                      <v-flex class="text-xs-center" xs12 md6>
                        <v-btn
                          block
                          :disabled="dataIsLoading"
                          @click="() => { multidexModules.forEach(({name}) => toggleDataUpdate(name, server, true)); }">
                          Reload All
                        </v-btn>
                      </v-flex>
                      <v-flex class="text-xs-center" xs12 md6>
                        <v-btn
                          block
                          :disabled="dataIsLoading"
                          @click="() => { multidexModules.forEach(({name}) => toggleDataDelete(name, server, true)); }">
                          Delete All
                        </v-btn>
                      </v-flex>
                    </v-layout>
                    </v-container>
                  </v-flex>
                </v-layout>
                <v-layout row>
                  <v-flex xs12>
                    <v-divider/>
                  </v-flex>
                </v-layout>
                <v-layout row wrap v-for="multidexModule in multidexModules" :key="multidexModule.name">
                  <v-flex xs3 class="text-xs-center pa-0" style="margin: auto; border-right: var(--border-color) 1px solid;">
                    <v-container fluid>
                      <v-layout row>
                        <v-flex xs12 v-text="multidexModule.fullName"/>
                      </v-layout>
                      <v-layout row wrap v-show="!stateInfo[multidexModule.name].isLoading">
                        <v-flex xs12 md6>
                          <v-btn
                            block
                            :disabled="dataIsLoading"
                            @click="() => { dataUpdate[multidexModule.name] = servers.slice(); dataDelete[multidexModule.name] = []; }">
                            Reload All
                          </v-btn>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-btn
                            block
                            :disabled="dataIsLoading"
                            @click="() => { dataDelete[multidexModule.name] = servers.slice(); dataUpdate[multidexModule.name] = []; }">
                            Delete All
                          </v-btn>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-flex>
                  <v-flex
                    v-show="!stateInfo[multidexModule.name].isLoading"
                    xs3 class="text-xs-center pa-0"
                    v-for="server in servers"
                    :key="`${multidexModule.name}-${server}`">
                    <v-container fluid>
                      <v-layout row>
                        <v-flex xs12>
                          <span v-if="stateInfo[multidexModule.name].numEntries[server] > 0">
                            <b>Cached:</b><br>{{ new Date(stateInfo[multidexModule.name].cacheTimes[server]).toLocaleString() }}
                          </span>
                          <span v-else>
                            No data cached.
                          </span>
                          <p v-if="stateInfo[multidexModule.name].updateTimes && updateTimes[multidexModule.name] && stateInfo[multidexModule.name].updateTimes[server] && updateTimes[multidexModule.name][server] && (stateInfo[multidexModule.name].numEntries[server] === 0 || new Date(updateTimes[multidexModule.name][server]) > new Date(stateInfo[multidexModule.name].updateTimes[server]))">
                            <v-alert color="info" class="pt-2 pb-2 pl-2 pr-2" :value="true">
                              Update available
                            </v-alert>
                          </p>
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex xs12 md6>
                          <v-btn block :disabled="dataIsLoading" :outline="!dataUpdate[multidexModule.name].includes(server)" @click="toggleDataUpdate(multidexModule.name, server)">
                            <v-icon>cloud_download</v-icon>
                          </v-btn>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-btn block :disabled="dataIsLoading" :outline="!dataDelete[multidexModule.name].includes(server)" @click="toggleDataDelete(multidexModule.name, server)">
                            <v-icon>cloud_off</v-icon>
                          </v-btn>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-flex>
                  <v-flex
                    v-show="stateInfo[multidexModule.name].isLoading"
                    xs9 class="text-xs-center pa-0">
                    <v-progress-circular indeterminate/>
                    <h4 class="subheading" v-text="stateInfo[multidexModule.name].loadingMessage || 'Waiting for data to finish loading.'"/>
                  </v-flex>
                  <v-flex xs12>
                    <v-divider/>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-btn flat :disabled="!dataFormHasChanged || dataIsLoading" @click="dataFormSubmit">
                Apply Changes
              </v-btn>
              <v-btn flat @click="dataFormReset">
                Cancel
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { moduleInfo } from '@/store';

const multidexModules = moduleInfo.filter(m => m.type === 'multidex');
export default {
  computed: {
    ...mapState(['updateTimes']),
    ...mapState('settings', ['lightMode', 'activeServer']),
    multidexModules: () => multidexModules.slice(),
    ...(() => {
      // get state for each module
      let result = {};
      multidexModules.map(m => m.name).forEach(m => {
        const stateMapping = {};
        stateMapping[`${m}Data`] = 'pageDb';
        stateMapping[`${m}NumEntries`] = 'numEntries';
        stateMapping[`${m}IsLoading`] = 'isLoading';
        stateMapping[`${m}CacheTimes`] = 'cacheTimes';
        stateMapping[`${m}UpdateTimes`] = 'updateTimes';
        stateMapping[`${m}LoadingMessage`] = 'loadingMessage';

        result = {
          ...result,
          ...mapState(m, stateMapping),
        };
      });
      return result;
    })(),
    stateInfo () {
      const info = {};
      multidexModules.map(m => m.name).forEach(type => {
        info[type] = {
          data: this[`${type}Data`],
          numEntries: this[`${type}NumEntries`],
          isLoading: this[`${type}IsLoading`],
          cacheTimes: this[`${type}CacheTimes`],
          updateTimes: this[`${type}UpdateTimes`],
          loadingMessage: this[`${type}LoadingMessage`],
        };
      });
      return info;
    },
    lightModeCheckboxRules () {
      return [
        v => v !== this.lightMode || 'Setting is the same as current',
      ];
    },
    generalForm () {
      return this.$refs['general-settings'];
    },
    servers () {
      return ['gl', 'eu', 'jp'];
    },
    dataIsLoading () {
      return Object.values(this.stateInfo).reduce((acc, val) => acc || val.isLoading, false);
    },
    dataFormHasChanged () {
      const hasUpdates = Object.values(this.dataUpdate).reduce((acc, val) => acc || val.length > 0, false);
      const hasDeletes = Object.values(this.dataDelete).reduce((acc, val) => acc || val.length > 0, false);
      return hasUpdates || hasDeletes;
    },
    generalFormHasChanged () {
      const changedDarkSetting = this.general.lightMode !== this.lightMode;
      const changedActiveServer = this.general.activeServer !== this.activeServer;
      return changedDarkSetting || changedActiveServer;
    },
  },
  data () {
    const dataUpdate = {};
    const dataDelete = {};
    multidexModules.map(m => m.name)
      .forEach(m => {
        // each entry contains array of servers to re-download
        dataUpdate[m] = [];
        dataDelete[m] = [];
      });
    return {
      general: {
        valid: false,
        lightMode: true,
        activeServer: 'gl',
      },
      dataUpdate,
      dataDelete,
      checkingForUpdates: false,
    };
  },
  mounted () {
    this.general.lightMode = this.lightMode;
    this.general.activeServer = this.activeServer;
  },
  watch: {
    lightMode (newValue) {
      this.general.lightMode = newValue;
    },
    activeServer (newValue) {
      this.general.activeServer = newValue;
    },
  },
  methods: {
    ...mapActions(['setActiveServer', 'fetchUpdateTimes']),
    ...mapActions('settings', ['setLightMode']),
    ...(() => {
      // get actions for each module
      let result = {};
      multidexModules.map(m => m.name).forEach(m => {
        const actionMapping = {};
        actionMapping[`${m}DataUpdate`] = 'updateData';
        actionMapping[`${m}DataDelete`] = 'deleteData';
        result = {
          ...result,
          ...mapActions(m, actionMapping),
        };
      });
      return result;
    })(),
    async generalFormSubmit () {
      if (this.general.lightMode !== this.lightMode) {
        await this.setLightMode(this.general.lightMode);
      }

      if (this.general.activeServer !== this.activeServer) {
        await this.setActiveServer(this.general.activeServer);
      }

      this.generalFormReset();
    },
    generalFormReset () {
      this.generalForm.reset();
      this.general.lightMode = this.lightMode;
      this.general.activeServer = this.activeServer;
    },
    toggleDataUpdate (dataType, server, forcedValue) {
      const hasServer = this.dataUpdate[dataType].includes(server);
      if (hasServer && (forcedValue === false || forcedValue === undefined)) {
        this.dataUpdate[dataType] = this.dataUpdate[dataType].filter(s => s !== server);
      } else {
        if (!hasServer) {
          this.dataUpdate[dataType].push(server);
        }
        // remove from delete list
        if (this.dataDelete[dataType].includes(server)) {
          this.dataDelete[dataType] = this.dataDelete[dataType].filter(s => s !== server);
        }
      }
    },
    toggleDataDelete (dataType, server, forcedValue) {
      const hasServer = this.dataDelete[dataType].includes(server);
      if (hasServer && (forcedValue === false || forcedValue === undefined)) {
        this.dataDelete[dataType] = this.dataDelete[dataType].filter(s => s !== server);
      } else {
        if (!hasServer) {
          this.dataDelete[dataType].push(server);
        }
        // remove from update list
        if (this.dataUpdate[dataType].includes(server)) {
          this.dataUpdate[dataType] = this.dataUpdate[dataType].filter(s => s !== server);
        }
      }
    },
    async dataFormSubmit () {
      for (const type of Object.keys(this.dataDelete)) {
        const servers = this.dataDelete[type];
        // skip empty entries
        if (servers.length === 0) {
          continue;
        } else if (this[`${type}DataDelete`]) {
          try {
            await this[`${type}DataDelete`](servers);
          } catch (err) {
            console.error(type, err);
          }
        } else {
          console.warn('No delete function found for', type);
        }
      }

      for (const type of Object.keys(this.dataUpdate)) {
        const servers = this.dataUpdate[type];
        // skip empty entries
        if (servers.length === 0) {
          continue;
        } else if (this[`${type}DataUpdate`]) {
          try {
            await this[`${type}DataUpdate`](servers);
          } catch (err) {
            console.error(type, err);
          }
        } else {
          console.warn('No update function found for', type);
        }
      }
      this.dataFormReset();
    },
    dataFormReset () {
      Object.keys(this.dataUpdate)
        .forEach(key => {
          this.dataUpdate[key] = [];
        });
      Object.keys(this.dataDelete)
        .forEach(key => {
          this.dataDelete[key] = [];
        });
    },
    async checkForUpdates () {
      this.checkingForUpdates = true;
      try {
        await this.fetchUpdateTimes();
      } catch (err) {
        console.error(err);
      } finally {
        this.checkingForUpdates = false;
      }
    },
  },
};
</script>
