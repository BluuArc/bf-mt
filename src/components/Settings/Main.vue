<template>
    <v-container grid-list-lg>
      <v-layout row>
        <v-flex xs12>
          <v-form ref="general-settings" v-model="general.valid" id="general-settings">
            <v-card raised>
              <v-card-title>
                <h3 class="title">General Settings</h3>
              </v-card-title>
              <v-card-text>
                <v-switch v-model="general.darkMode" label="Use Dark Mode" :rules="darkModeCheckboxRules"/>
              </v-card-text>
              <v-card-actions>
                <v-btn :disabled="!general.valid" flat @click="generalFormSubmit">Apply Changes</v-btn>
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
            <v-card-text v-if="dataIsLoading" class="text-xs-center">
              <v-progress-circular indeterminate/>
              <h4 class="subheading">Waiting for data to finish loading.</h4>
            </v-card-text>
            <v-card-text v-else class="pt-5">
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
                      <v-layout row wrap>
                        <v-flex xs12 sm6>
                          <v-btn
                            block
                            @click="() => { dataUpdate[key] = servers.slice(); dataDelete[key] = []; }">
                            Reload All
                          </v-btn>
                        </v-flex>
                        <v-flex xs12 sm6>
                          <v-btn
                            block
                            @click="() => { dataDelete[key] = servers.slice(); dataUpdate[key] = []; }">
                            Delete All
                          </v-btn>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-flex>
                  <v-flex
                    xs3 class="text-xs-center pa-0"
                    v-for="server in servers"
                    :key="`${key}-${server}`">
                    <v-container fluid>
                      <v-layout row>
                        <v-flex xs12>
                          <span v-if="Object.keys(unitData[server]).length > 0">
                            <b>Cached:</b><br>{{ new Date().toLocaleString() }}
                          </span>
                          <span v-else>
                            No data cached.
                          </span>
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex xs12 sm6>
                          <v-btn block :outline="!dataUpdate[key].includes(server)" @click="toggleDataUpdate(key, server)">
                            <v-icon>cloud_download</v-icon>
                          </v-btn>
                        </v-flex>
                        <v-flex xs12 sm6>
                          <v-btn block :outline="!dataDelete[key].includes(server)" @click="toggleDataDelete(key, server)">
                            <v-icon>cloud_off</v-icon>
                          </v-btn>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-flex>
                  <v-flex xs12>
                    <v-divider/>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-btn flat :disabled="!dataFormHasChanged">
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
    ...mapState('settings', ['darkMode']),
    ...mapState('units', ['units-gl', 'units-eu', 'units-jp', 'loadingUnits']),
    unitData () {
      return {
        gl: this['units-gl'],
        eu: this['units-eu'],
        jp: this['units-jp'],
      };
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
      return !!this.loadingUnits;
    },
    dataSettingNameMapping () {
      return {
        units: 'Units',
        // items: 'Items',
        // braveBursts: 'Brave Bursts',
        // extraSkills: 'Extra Skills',
        // leaderSkills: 'Leader Skills',
      };
    },
    dataFormHasChanged () {
      const hasUpdates = Object.values(this.dataUpdate).reduce((acc, val) => acc || val.length > 0, false);
      const hasDeletes = Object.values(this.dataDelete).reduce((acc, val) => acc || val.length > 0, false);
      return hasUpdates || hasDeletes;
    },
  },
  data () {
    return {
      general: {
        valid: false,
        darkMode: true,
      },
      // each entry contains array of servers to re-download
      dataUpdate: {
        units: [],
        items: [],
        braveBursts: [],
        extraSkills: [],
        leaderSkills: [],
      },
      dataDelete: {
        units: [],
        items: [],
        braveBursts: [],
        extraSkills: [],
        leaderSkills: [],
      },
    };
  },
  mounted () {
    this.general.darkMode = this.darkMode;
  },
  methods: {
    ...mapActions('settings', ['setDarkMode']),
    async generalFormSubmit () {
      // valid only if settings are different
      if (this.generalForm.validate()) {
        await this.setDarkMode(this.general.darkMode);
        this.generalFormReset();
      }
    },
    generalFormReset () {
      this.generalForm.reset();
      this.general.darkMode = this.darkMode;
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
