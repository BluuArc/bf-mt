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
                    @newsquad="$ev => squad = $ev"
                    @newunits="$ev => squad.units = $ev"
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
                <v-flex v-if="parsingCode">
                  <loading-indicator loadingMessage="Parsing input code"/>
                </v-flex>
                <v-flex v-else-if="parseState.type">
                  <v-alert
                    class="squad-message-alert"
                    outline
                    :value="true"
                    :type="parseState.type">
                    <div>
                      <div class="d-flex-container items-center">
                        <span style="flex: auto;">{{ parseState.message }}</span>
                        <v-btn
                          v-if="warningMessages.length > 0"
                          @click="showWarnings = !showWarnings"
                          flat icon style="flex: none;">
                          <v-icon>{{ showWarnings ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
                        </v-btn>
                      </div>
                      <div v-if="warningMessages.length > 0">
                        <v-expansion-panel
                          :value="showWarnings ? 0 : -1"
                          @input="$val => showWarnings = $val === 0">
                          <v-expansion-panel-content :key="0">
                            <v-list>
                              <v-list-tile
                                v-for="message in warningMessages"
                                :key="message">
                                <v-list-tile-content>
                                  <v-list-tile-title>
                                    {{ message }}
                                  </v-list-tile-title>
                                </v-list-tile-content>
                              </v-list-tile>
                            </v-list>
                          </v-expansion-panel-content>
                        </v-expansion-panel>
                      </div>
                    </div>
                  </v-alert>
                </v-flex>
                <v-layout justify-end>
                  <v-flex style="flex-grow: 0;">
                    <v-btn
                      @click="attemptSquadImport"
                      :disabled="!inputCode || parsingCode"
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
  squadToShorthand,
  generateDefaultSquad,
  getMultidexDatabaseIdsFromSquads,
  fixSquadErrors,
} from '@/modules/core/squads';
import { Logger } from '@/modules/Logger';
import { mapState, mapActions } from 'vuex';
import ModuleChecker from '@/components/ModuleChecker';
import CardTabsContainer from '@/components/CardTabsContainer';
import SquadListCardEditable from '@/components/Tools/Squads/SquadListCardEditable';
import LoadingIndicator from '@/components/LoadingIndicator';
// import databaseClient from '@/modules/BfmtDatabase/client';

const logger = new Logger({ prefix: '[SquaddAdd]' });
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
    LoadingIndicator,
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
    parseState () {
      const type = (this.parseErrorMessage && 'error') ||
        (this.parsedSuccessfully && this.warningMessages.length === 0 && 'success') ||
        (this.parsedSuccessfully && this.warningMessages.length > 0 && 'warning');
      const message = this.parseErrorMessage ||
       (this.warningMessages.length > 0 && `Parsed input code with ${this.warningMessages.length} warnings.`) ||
       'Successfully parsed input code';
      return { type, message };
    },
    currentSquadCode () {
      try {
        return squadToShorthand(this.squad);
      } catch {
        return '';
      }
    },
  },
  data () {
    return {
      squad: generateDefaultSquad(),
      inputCode: '',
      parseErrorMessage: '',
      warningMessages: [],
      parsedSuccessfully: false,
      parsingCode: false,
      activeTabIndex: 0,
      squadUnits: {},
      squadItems: {},
      squadExtraSkills: {},
      isLoadingSquadData: false,
      selectedIndex: -1,
      showWarnings: false,
      lastImportedSquadCode: '',
    };
  },
  mounted () {
    this.$store.commit('setHtmlOverflowDisableState', false);
    if (this.inputCode) {
      this.activeTabIndex = 1;
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
    async attemptSquadImport () {
      this.parseErrorMessage = '';
      this.parsedSuccessfully = false;
      this.warningMessages = [];
      if (!this.inputCode) {
        this.parseErrorMessage = 'No input specified';
      } else {
        this.parsingCode = true;
        await this.$nextTick();
        try {
          const initialSquad = shorthandToSquad(this.inputCode);
          await this.updateSquadPageDbForSquad(initialSquad);
          const { warnings, ...fixedSquad } = fixSquadErrors(initialSquad, {
            getUnit: this.getUnit,
            getExtraSkill: this.getExtraSkill,
            getItem: this.getItem,
          });
          this.warningMessages = warnings;
          this.squad = fixedSquad;
          this.lastImportedSquadCode = squadToShorthand(fixedSquad);
          this.parsedSuccessfully = true;
        } catch (err) {
          logger.error('error parsing squad', err);
          this.parseErrorMessage = 'Import code is invalid and cannot be parsed.';
        }
        this.parsingCode = false;
      }
    },
    async updateSquadPageDbForSquad (squad) {
      if (squad) {
        const databaseIds = getMultidexDatabaseIdsFromSquads(squad);
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
      if (newValue && this.warningMessages.length === 0) {
        this.activeTabIndex = 1; // show import tab
      }
    },
    'squad.units': {
      deep: true,
      handler () {
        this.updateSquadPageDbForSquad(this.squad);
      },
    },
    warningMessages (newValue) {
      this.showWarnings = newValue.length > 0;
    },
  },
};
</script>

<style lang="less">
.squad-message-alert {
  .v-list__tile {
    padding: 0;
  }
}
</style>
