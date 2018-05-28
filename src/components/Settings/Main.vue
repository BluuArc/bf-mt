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
                <v-switch v-model="general.darkMode" label="Use Dark Mode"/>
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
              <h3 class="title">Data Settings</h3>
            </v-card-title>
            <!-- <v-card-text v-if="dataIsLoading" class="text-xs-center">
              <v-progress-circular indeterminate/>
              <h4 class="subheading">Waiting for data to finish loading.</h4>
            </v-card-text> -->
            <v-card-text class="pt-5">
              <v-container fluid class="pa-0">
                <v-layout row>
                  <v-flex
                    xs3
                    class="text-xs-center subheading pa-0"
                    style="font-weight: bold; border-right: var(--border-color) 1px solid;">Data Type</v-flex>
                  <v-flex
                    xs3 class="text-xs-center subheading pa-0" style="font-weight: bold"
                    v-for="server in servers"
                    :key="server"
                    v-text="server.toUpperCase()"/>
                </v-layout>
                <v-layout row>
                  <v-flex xs12>
                    <v-divider/>
                  </v-flex>
                </v-layout>
                <v-layout row wrap v-for="(value, key) in dataSettingNameMapping" :key="key">
                  <v-flex xs3 class="text-xs-center pa-0" style="margin: auto; border-right: var(--border-color) 1px solid;">
                    <v-container fluid>
                      <v-layout row>
                        <v-flex xs12 v-text="value"/>
                      </v-layout>
                      <v-layout row wrap v-show="!stateInfo[key].isLoading">
                        <v-flex xs12 md6>
                          <v-btn
                            block
                            :disabled="dataIsLoading"
                            @click="() => { dataUpdate[key] = servers.slice(); dataDelete[key] = []; }">
                            Reload All
                          </v-btn>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-btn
                            block
                            :disabled="dataIsLoading"
                            @click="() => { dataDelete[key] = servers.slice(); dataUpdate[key] = []; }">
                            Delete All
                          </v-btn>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-flex>
                  <v-flex
                    v-show="!stateInfo[key].isLoading"
                    xs3 class="text-xs-center pa-0"
                    v-for="server in servers"
                    :key="`${key}-${server}`">
                    <v-container fluid>
                      <v-layout row>
                        <v-flex xs12>
                          <span v-if="stateInfo[key].numEntries[server] > 0">
                            <b>Cached:</b><br>{{ new Date(stateInfo[key].cacheTimes[server]).toLocaleString() }}
                          </span>
                          <span v-else>
                            No data cached.
                          </span>
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex xs12 md6>
                          <v-btn block :disabled="dataIsLoading" :outline="!dataUpdate[key].includes(server)" @click="toggleDataUpdate(key, server)">
                            <v-icon>cloud_download</v-icon>
                          </v-btn>
                        </v-flex>
                        <v-flex xs12 md6>
                          <v-btn block :disabled="dataIsLoading" :outline="!dataDelete[key].includes(server)" @click="toggleDataDelete(key, server)">
                            <v-icon>cloud_off</v-icon>
                          </v-btn>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-flex>
                  <v-flex
                    v-show="stateInfo[key].isLoading"
                    xs9 class="text-xs-center pa-0">
                    <v-progress-circular indeterminate/>
                    <h4 class="subheading">Waiting for data to finish loading.</h4>
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

export default {
  computed: {
    ...mapState('settings', ['darkMode', 'activeServer']),
    ...mapState('units', {
      unitData: 'pageDb',
      unitNumEntries: 'numEntries',
      unitsLoading: 'isLoading',
      unitCacheTimes: 'cacheTimes',
    }),
    ...mapState('items', {
      itemData: 'pageDb',
      itemNumEntries: 'numEntries',
      itemsLoading: 'isLoading',
      itemCacheTimes: 'cacheTimes',
    }),
    ...mapState('bursts', {
      burstData: 'pageDb',
      burstNumEntries: 'numEntries',
      burstsLoading: 'isLoading',
      burstCacheTimes: 'cacheTimes',
    }),
    ...mapState('extraSkills', {
      extraSkillData: 'pageDb',
      extraSkillNumEntries: 'numEntries',
      extraSkillsLoading: 'isLoading',
      extraSkillCacheTimes: 'cacheTimes',
    }),
    ...mapState('leaderSkills', {
      leaderSkillData: 'pageDb',
      leaderSkillNumEntries: 'numEntries',
      leaderSkillsLoading: 'isLoading',
      leaderSkillCacheTimes: 'cacheTimes',
    }),
    stateInfo () {
      const info = {};
      Object.keys(this.dataSettingNameMapping)
        .forEach(type => {
          info[type] = {
            data: this[`${type}Data`],
            numEntries: this[`${type}NumEntries`],
            isLoading: this[`${type}sLoading`],
            cacheTimes: this[`${type}CacheTimes`],
          };
        });
      return info;
    },
    darkModeCheckboxRules () {
      return [
        v => v !== this.darkMode || 'Setting is the same as current',
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
    dataSettingNameMapping () {
      return {
        unit: 'Units',
        item: 'Items',
        burst: 'Brave Bursts',
        extraSkill: 'Extra Skills',
        leaderSkill: 'Leader Skills',
      };
    },
    dataFormHasChanged () {
      const hasUpdates = Object.values(this.dataUpdate).reduce((acc, val) => acc || val.length > 0, false);
      const hasDeletes = Object.values(this.dataDelete).reduce((acc, val) => acc || val.length > 0, false);
      return hasUpdates || hasDeletes;
    },
    generalFormHasChanged () {
      const changedDarkSetting = this.general.darkMode !== this.darkMode;
      const changedActiveServer = this.general.activeServer !== this.activeServer;
      return changedDarkSetting || changedActiveServer;
    },
  },
  data () {
    return {
      general: {
        valid: false,
        darkMode: true,
        activeServer: 'gl',
      },
      // each entry contains array of servers to re-download
      dataUpdate: {
        unit: [],
        item: [],
        burst: [],
        extraSkill: [],
        leaderSkill: [],
      },
      dataDelete: {
        unit: [],
        item: [],
        burst: [],
        extraSkill: [],
        leaderSkill: [],
      },
    };
  },
  mounted () {
    this.general.darkMode = this.darkMode;
    this.general.activeServer = this.activeServer;
  },
  watch: {
    darkMode (newValue) {
      this.general.darkMode = newValue;
    },
    activeServer (newValue) {
      this.general.activeServer = newValue;
    },
  },
  methods: {
    ...mapActions(['setActiveServer']),
    ...mapActions('settings', ['setDarkMode']),
    ...mapActions('units', {
      unitDataUpdate: 'updateData',
      unitDataDelete: 'deleteData',
    }),
    ...mapActions('items', {
      itemDataUpdate: 'updateData',
      itemDataDelete: 'deleteData',
    }),
    ...mapActions('bursts', {
      burstDataUpdate: 'updateData',
      burstDataDelete: 'deleteData',
    }),
    ...mapActions('extraSkills', {
      extraSkillDataUpdate: 'updateData',
      extraSkillDataDelete: 'deleteData',
    }),
    ...mapActions('leaderSkills', {
      leaderSkillDataUpdate: 'updateData',
      leaderSkillDataDelete: 'deleteData',
    }),
    async generalFormSubmit () {
      if (this.general.darkMode !== this.darkMode) {
        await this.setDarkMode(this.general.darkMode);
      }

      if (this.general.activeServer !== this.activeServer) {
        await this.setActiveServer(this.general.activeServer);
      }

      this.generalFormReset();
    },
    generalFormReset () {
      this.generalForm.reset();
      this.general.darkMode = this.darkMode;
      this.general.activeServer = this.activeServer;
    },
    toggleDataUpdate (dataType, server) {
      const hasServer = this.dataUpdate[dataType].includes(server);
      if (hasServer) {
        this.dataUpdate[dataType] = this.dataUpdate[dataType].filter(s => s !== server);
      } else {
        this.dataUpdate[dataType].push(server);
        // remove from delete list
        if (this.dataDelete[dataType].includes(server)) {
          this.dataDelete[dataType] = this.dataDelete[dataType].filter(s => s !== server);
        }
      }
    },
    toggleDataDelete (dataType, server) {
      const hasServer = this.dataDelete[dataType].includes(server);
      if (hasServer) {
        this.dataDelete[dataType] = this.dataDelete[dataType].filter(s => s !== server);
      } else {
        this.dataDelete[dataType].push(server);
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
  },
};
</script>
