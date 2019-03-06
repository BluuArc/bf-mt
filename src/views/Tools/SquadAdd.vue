<template>
  <module-checker
    :requiredModules="requiredModules"
    :ensureDbSync="true">
    <v-container>
      <v-layout column>
        <v-flex>
          <v-card>
            <card-tabs-container :tabs="tabConfig" v-model="activeTabIndex">
              <v-layout column slot="squad">
                <v-flex>
                  <squad-list-card-editable
                    flat
                    @selectedindex="$ev => selectedIndex = $ev"
                    :squad="squad"
                    :getUnit="getUnit"
                    :getItem="getItem"
                    :getExtraSkill="getExtraSkill"
                    :isLoadingInParent="isLoadingSquadData"/>
                </v-flex>
                <v-flex>
                  {{ squad }}
                </v-flex>
              </v-layout>
              <v-layout column slot="import-code">
                <v-flex>
                  <v-text-field v-model="inputCode"/>
                </v-flex>
                <v-flex v-if="parseErrorMessage || parsedSuccessfully">
                  <v-alert
                    :value="true" :type="parseErrorMessage ? 'error' : 'success'">
                    {{ parseErrorMessage || 'Successfully parsed input code' }}
                  </v-alert>
                </v-flex>
                <v-layout justify-end>
                  <v-flex style="flex-grow: 0;">
                    <v-btn
                      @click="attemptSquadImport"
                      :disabled="!inputCode"
                      flat>
                      Import
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-layout>
            </card-tabs-container>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </module-checker>
</template>

<script>
import { squadRequiredModules } from '@/router/tool-routes';
import {
  shorthandToSquad,
  generateDefaultSquad,
  getMultidexDatabaseIdsFromSquads,
} from '@/modules/core/squads';
import { Logger } from '@/modules/Logger';
import { mapState, mapActions } from 'vuex';
import ModuleChecker from '@/components/ModuleChecker';
import CardTabsContainer from '@/components/CardTabsContainer';
import SquadListCardEditable from '@/components/Tools/Squads/SquadListCardEditable';
// import databaseClient from '@/modules/BfmtDatabase/client';

const logger = new Logger({ prefix: 'SquaddAdd' });
export default {
  props: {
    importSquad: {
      type: String,
      default: '',
    },
  },
  components: {
    ModuleChecker,
    CardTabsContainer,
    SquadListCardEditable,
  },
  computed: {
    ...mapState('settings', ['activeServer']),
    ...mapState('units', {
      allUnits: 'pageDb',
    }),
    ...mapState('items', {
      allItems: 'pageDb',
    }),
    ...mapState('extraSkills', {
      allExtraSkills: 'pageDb',
    }),
    requiredModules: () => squadRequiredModules,
    tabConfig: () => ['squad', 'import code'].map(name => ({ name, slot: name.replace(/ /g, '-') })),
  },
  data () {
    return {
      squad: generateDefaultSquad(),
      inputCode: '',
      parseErrorMessage: '',
      parsedSuccessfully: false,
      activeTabIndex: 0,
      squadUnits: {},
      squadItems: {},
      squadExtraSkills: {},
      isLoadingSquadData: false,
      selectedIndex: -1,
    };
  },
  mounted () {
    if (this.inputCode) {
      this.attemptSquadImport();
    } else {
      this.updateSquadPageDb();
    }
  },
  methods: {
    ...mapActions('units', {
      getUnits: 'getByIds',
    }),
    ...mapActions('items', {
      getItems: 'getByIds',
    }),
    ...mapActions('extraSkills', {
      getExtraSkills: 'getByIds',
    }),
    attemptSquadImport () {
      this.parseErrorMessage = '';
      this.parsedSuccessfully = false;
      if (!this.inputCode) {
        this.parseErrorMessage = 'No input specified';
      } else {
        try {
          this.squad = shorthandToSquad(this.inputCode);
          this.parsedSuccessfully = true;
        } catch (err) {
          logger.error('error parsing squad', err);
          this.parseErrorMessage = 'Import code is invalid and cannot be parsed.';
        }
      }
    },
    async updateSquadPageDb () {
      if (this.squad) {
        const databaseIds = getMultidexDatabaseIdsFromSquads(this.squad);
        const toLowerCase = (input) => `${input[0].toLowerCase()}${input.slice(1)}`;
        const currentServer = this.activeServer;
        await ['Units', 'Items', 'ExtraSkills'].reduce((acc, name) => {
          const entriesToGet = [];
          const componentDb = this[`squad${name}`];
          const neededKeys = databaseIds[toLowerCase(name)];
          const newDb = {};
          const allKeys = Object.keys(componentDb).map(id => +id).concat(neededKeys);
          allKeys.forEach((id) => {
            if (!isNaN(id) && neededKeys.includes(id)) {
              if (!componentDb[id]) {
                entriesToGet.push(id);
              } else {
                newDb[id] = componentDb[id];
              }
            }
          });

          return acc.then(async () => {
            if (entriesToGet.length > 0) {
              if (!this.isLoadingSquadData) {
                this.isLoadingSquadData = true;
              }
              const retrievedEntries = await this[`get${name}`]({
                ids: entriesToGet,
                server: currentServer,
                extractedFields: [],
              });
              this[`squad${name}`] = { ...newDb, ...retrievedEntries };
            } else {
              this[`squad${name}`] = newDb;
            }
          });
        }, Promise.resolve());
        this.isLoadingSquadData = false;
      }
    },
    getUnit (id) {
      return this.squadUnits[id] || {};
    },
    getItem (id) {
      return this.squadItems[id] || {};
    },
    getExtraSkill (id) {
      return this.squadExtraSkills[id] || {};
    },
  },
  watch: {
    importSquad: {
      immediate: true,
      handler (value) {
        if (value) {
          this.inputCode = value;
        }
      },
    },
    inputCode (newValue) {
      // clear message on input clear
      if (!newValue) {
        this.parseErrorMessage = '';
      }
      this.parsedSuccessfully = false;
    },
    parseErrorMessage (newValue) {
      if (newValue) {
        this.activeTabIndex = 1; // show import tab
      }
    },
    'squad.units': {
      deep: true,
      handler () {
        this.updateSquadPageDb();
      },
    },
  },
};
</script>
