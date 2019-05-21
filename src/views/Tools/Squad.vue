<template>
  <module-checker
    :requiredModules="requiredModules"
    :ensureDbSync="true">
    <v-container fluid class="squad-page" v-resize="updateTopNavbarHeight">
      <v-container class="pa-0">
        <v-layout justify-center>
          <v-flex xs12 v-if="!editMode">
            <squad-list-card
              :squad="squad"
              :getUnit="getUnit"
              :getItem="getItem"
              :getExtraSkill="getExtraSkill"
              :isLoadingInParent="isLoadingSquadData"
              :key="squadCode"
            >
              <v-card-actions slot="card-actions" slot-scope="{ disabled }">
                <v-btn
                  flat
                  :icon="minimizeSquadActionButtons"
                  :disabled="disabled"
                  @click="editMode = true">
                  <v-icon :left="!minimizeSquadActionButtons">edit</v-icon>
                  <span v-if="!minimizeSquadActionButtons">
                    Edit
                  </span>
                </v-btn>
                <v-btn
                  flat
                  :icon="minimizeSquadActionButtons"
                  :disabled="disabled"
                  @click="activeSquadDialog = 'share'">
                  <v-icon :left="!minimizeSquadActionButtons">share</v-icon>
                  <span v-if="!minimizeSquadActionButtons">
                    Share
                  </span>
                </v-btn>
                <v-btn
                  v-if="squadCode"
                  flat
                  :icon="minimizeSquadActionButtons"
                  :disabled="disabled"
                  :to="getSquadUrl(squadCode)">
                  <v-icon :left="!minimizeSquadActionButtons">file_copy</v-icon>
                  <span v-if="!minimizeSquadActionButtons">
                    Copy
                  </span>
                </v-btn>
                <v-spacer/>
                <v-btn
                  flat
                  :icon="minimizeSquadActionButtons"
                  :disabled="disabled"
                  @click="activeSquadDialog = 'delete'">
                  <v-icon :left="!minimizeSquadActionButtons">delete</v-icon>
                  <span v-if="!minimizeSquadActionButtons">
                    Delete
                  </span>
                </v-btn>
              </v-card-actions>
            </squad-list-card>
          </v-flex>
          <v-flex xs12 v-else>
            <squad-list-card-editable
              :squad="tempSquad"
              :squadId="id"
              :getUnit="getUnit"
              :getItem="getItem"
              :getExtraSkill="getExtraSkill"
              :redirectOnCancel="false"
              :isLoadingInParent="isLoadingSquadData"
              @newsquad="$sq => tempSquad = $sq"
              @newunits="onNewUnits"
              @save="() => { squad = tempSquad; editMode = false; }"
              @cancel="editMode = false"
            />
          </v-flex>
        </v-layout>
      </v-container>
      <v-flex xs12>
        <v-divider class="mt-2"/>
      </v-flex>
      <v-flex xs12>
        <v-card>
          <tab-container
            v-if="!isLoadingSquadData && !editMode"
            v-model="currentTabIndex"
            class="mt-2"
            :centeredTabs="true"
            :growTabs="true"
            :tabs="tabConfig">
            <v-layout slot="buffs" column>
              <v-expansion-panel class="configuration-panel">
                <v-expansion-panel-content>
                  <div slot="header">
                    Configure Buff View
                  </div>
                  <section>
                    <order-configurator
                      v-model="buffTables"
                      :getEntryName="(configIndex) => possibleTables[configIndex].name"
                      :fullValueSet="defaultBuffTables"
                    />
                    <section>
                      <v-btn flat @click="buffTables = buffTables.concat(defaultBuffTables.filter((_, i) => !buffTables.includes(i)))">Show All</v-btn>
                      <v-btn flat @click="buffTables = []">Hide All</v-btn>
                      <v-btn flat @click="buffTables = defaultBuffTables.slice()">Reset to Default</v-btn>
                    </section>
                  </section>
                </v-expansion-panel-content>
              </v-expansion-panel>
              <dl>
                <template v-for="tableConfigIndex in buffTables">
                  <dt
                    class="title"
                    :style="buffGroupTitleStyle"
                    :key="`${possibleTables[tableConfigIndex].targetType}-${possibleTables[tableConfigIndex].effectType}-title`"
                    v-text="possibleTables[tableConfigIndex].name"
                  />
                  <dd :key="`${possibleTables[tableConfigIndex].targetType}-${possibleTables[tableConfigIndex].effectType}-table`">
                    <squad-buff-expandable-list
                      :getUnit="getUnit"
                      :getItem="getItem"
                      :getExtraSkill="getExtraSkill"
                      :squad="squad"
                      :targetType="possibleTables[tableConfigIndex].targetType"
                      :effectType="possibleTables[tableConfigIndex].effectType"
                    />
                  </dd>
                </template>
              </dl>
            </v-layout>
            <v-layout slot="spark-statistics">
              <squad-spark-statistics-area
                :getUnit="getUnit"
                :getItem="getItem"
                :getExtraSkill="getExtraSkill"
                :squad="squad"
                :initialSimulatorOptions="simulatorOptions"
                @simoptions="$v => simulatorOptions = $v"
                @share="$sparkResult => { sparkResultToShare = $sparkResult; activeSquadDialog = 'share'; }"
                @apply="applySparkResult"
              />
            </v-layout>
            <v-layout slot="arena" style="overflow-x: auto;">
              <squad-arena-suggestion-table
                :getUnit="getUnit"
                :getItem="getItem"
                :getExtraSkill="getExtraSkill"
                :squad="squad"
              />
            </v-layout>
          </tab-container>
        </v-card>
      </v-flex>
      <v-dialog
        :value="!isLoadingSquadData && !!activeSquadDialog"
        @input="$v => activeSquadDialog = $v ? activeSquadDialog : ''"
        lazy>
        <template v-if="squadCode">
          <share-squad-card
            v-if="activeSquadDialog === 'share'"
            :squad="squad"
            :getUnit="getUnit"
            :getItem="getItem"
            :getExtraSkill="getExtraSkill"
            :sparkResult="sparkResultToShare"
            @back="activeSquadDialog = ''"/>
          <delete-squad-card
            v-else-if="activeSquadDialog === 'delete'"
            :squad="squad"
            :squadId="+id"
            :getUnit="getUnit"
            :getItem="getItem"
            :getExtraSkill="getExtraSkill"
            @delete="$router.push('/tools/squads')"
            @cancel="activeSquadDialog = ''"/>
        </template>
        <v-card v-else>
          <v-card-text>
            No squad selected
          </v-card-text>
          <v-card-actions style="justify-content: flex-end">
            <v-btn flat @click="activeSquadDialog = ''">
              Back
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </module-checker>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { squadRequiredModules } from '@/router/tool-routes';
import { Logger } from '@/modules/Logger';
import {
  squadToShorthand,
  getMultidexDatabaseIdsFromSquads,
  cloneSquad,
} from '@/modules/core/squads';
import { targetTypes, squadBuffTypes } from '@/modules/constants';
import ModuleChecker from '@/components/ModuleChecker';
import LoadingIndicator from '@/components/LoadingIndicator';
import SquadListCard from '@/components/Tools/Squads/SquadListCard';
import ShareSquadCard from '@/components/Tools/Squads/ShareSquadCard';
import DeleteSquadCard from '@/components/Tools/Squads/DeleteSquadCard';
import TabContainer from '@/components/CardTabsContainer';
import SquadListCardEditable from '@/components/Tools/Squads/SquadListCardEditable';
import SquadBuffExpandableList from '@/components/Multidex/BuffList/SquadBuffExpandableList';
import OrderConfigurator from '@/components/OrderConfigurator';
import SquadArenaSuggestionTable from '@/components/Tools/Squads/SquadArenaSuggestionTable';
import SquadSparkStatisticsArea from '@/components/Tools/Squads/SparkStatistics/Main';

const logger = new Logger({ prefix: '[Squad]' });
export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  components: {
    ModuleChecker,
    SquadListCard,
    ShareSquadCard,
    DeleteSquadCard,
    TabContainer,
    SquadListCardEditable,
    LoadingIndicator,
    SquadBuffExpandableList,
    OrderConfigurator,
    SquadArenaSuggestionTable,
    SquadSparkStatisticsArea,
  },
  computed: {
    ...mapState('settings', ['activeServer']),
    targetTypes: () => targetTypes,
    squadBuffTypes: () => squadBuffTypes,
    requiredModules: () => squadRequiredModules,
    tabConfig: () => [
      'Buffs',
      'Spark Statistics',
      'Arena',
    ].map(name => ({ name, slot: name.toLowerCase().replace(/ /g, '-') })),
    squadCode () {
      return this.squad ? squadToShorthand(this.squad) : '';
    },
    minimizeSquadActionButtons () {
      return this.$vuetify.breakpoint.xsOnly;
    },
    buffGroupTitleStyle () {
      return {
        top: `${this.topNavbarHeight}px`,
      };
    },
    possibleTables: () => Object.freeze([
      {
        name: 'Party Passives',
        targetType: targetTypes.PARTY,
        effectType: squadBuffTypes.PASSIVE,
      },
      {
        name: 'Party Buffs',
        targetType: targetTypes.PARTY,
        effectType: squadBuffTypes.PROC,
      },
      {
        name: 'For the Enemy',
        targetType: targetTypes.ENEMY,
        effectType: squadBuffTypes.PROC,
      },
      {
        name: 'Self Passives',
        targetType: targetTypes.SELF,
        effectType: squadBuffTypes.PASSIVE,
      },
      {
        name: 'Self Buffs',
        targetType: targetTypes.SELF,
        effectType: squadBuffTypes.PROC,
      },
    ]),
    defaultBuffTables () {
      return Object.freeze(this.possibleTables.map((_, i) => i));
    },
  },
  data () {
    return {
      squad: null,
      squadUnits: {},
      squadItems: {},
      squadExtraSkills: {},
      isLoadingSquadData: false,
      activeSquadDialog: '',
      editMode: false,
      currentTabIndex: 0,
      tempSquad: {},
      topNavbarHeight: 56,
      buffTables: [],
      sparkResultToShare: null,
      simulatorOptions: {},
    };
  },
  created () {
    this.buffTables = this.defaultBuffTables.slice();
  },
  mounted () {
    this.isLoadingSquadData = true;
    this.$store.dispatch('squads/getSquadById', this.id)
      .then(result => {
        this.squad = result.squad;
      });
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
    getUnit (id) {
      return this.squadUnits[id] || {};
    },
    getItem (id) {
      return this.squadItems[id] || {};
    },
    getExtraSkill (id) {
      return this.squadExtraSkills[id] || {};
    },
    async updatePageDbForSquad (squad) {
      if (squad) {
        const databaseIds = getMultidexDatabaseIdsFromSquads(squad);
        const toLowerCase = (input) => `${input[0].toLowerCase()}${input.slice(1)}`;
        const currentServer = this.activeServer;
        try {
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
                this[`squad${name}`] = Object.freeze({ ...newDb, ...retrievedEntries });
              } else {
                this[`squad${name}`] = Object.freeze(newDb);
              }
            });
          }, Promise.resolve());
        } catch (err) {
          logger.error(err);
        } finally {
          this.isLoadingSquadData = false;
        }
      }
    },
    setDocumentTitle () {
      const defaultTitle = 'BF-MT - Squad';
      if (this.squad && this.squad.name) {
        document.title = [defaultTitle, this.squad.name].join(' - ');
      } else {
        document.title = defaultTitle;
      }
    },
    getSquadUrl (squad) {
      return this.$router.resolve({
        path: '/tools/squads/add',
        query: { import: typeof squad !== 'string' ? squadToShorthand(squad) : squad },
      }).route.fullPath;
    },
    onNewUnits (units) {
      this.tempSquad = { ...this.tempSquad, units };
    },
    updateTopNavbarHeight () {
      const topNavbar = document.querySelector('nav.v-toolbar');
      this.topNavbarHeight = (topNavbar && topNavbar.offsetHeight) || 56;
    },
    async applySparkResult ({ squad, sparkResult } = {}) {
      squad.simulatorOptions = this.simulatorOptions;
      await this.$store.dispatch('squads/storeSquad', {
        server: this.$store.state.settings.activeServer,
        squad: squad,
        id: this.id,
      });

      this.sparkResultToShare = sparkResult;
      this.squad = squad;
    },
  },
  watch: {
    async squad (newSquad) {
      this.setDocumentTitle();
      await this.updatePageDbForSquad(newSquad);
      this.updateTopNavbarHeight();
    },
    editMode (isEditMode) {
      if (isEditMode) {
        this.tempSquad = cloneSquad(this.squad);
        this.tempSquad.simulatorOptions = this.simulatorOptions;
      } else {
        this.tempSquad = {};
      }
    },
    async tempSquad (newSquad) {
      if (newSquad && Array.isArray(newSquad.units)) {
        await this.updatePageDbForSquad(newSquad);
      }
    },
  },
};
</script>

<style lang="less">
.squad-page {
  .configuration-panel {
    .v-expansion-panel__header {
      padding-left: 8px;
      padding-right: 8px;
      font-weight: bold;
    }
  }
  dl {
    width: 100%;

    > dt {
      position: sticky;
      background: var(--background-color);
      z-index: 1;
      padding: 0.75em 0.25em;
      margin: 0 -0.25em;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
  }

  dd {
    // width: 100%;
    overflow-x: auto;
  }
}
</style>
