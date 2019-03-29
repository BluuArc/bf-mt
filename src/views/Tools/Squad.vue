<template>
  <module-checker
    :requiredModules="requiredModules"
    :ensureDbSync="true">
    <v-container>
      <v-layout justify-center>
        <v-flex xs12 v-if="!editMode">
          <squad-list-card
            :squad="squad"
            :getUnit="getUnit"
            :getItem="getItem"
            :getExtraSkill="getExtraSkill"
            :isLoadingInParent="isLoadingSquadData"
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
      <v-flex xs12>
        <v-divider class="mt-2"/>
      </v-flex>
      <v-flex xs12>
        <v-card>
          <tab-container
            v-if="!isLoadingSquadData && !editMode"
            v-model="currentTabIndex"
            class="mt-2"
            :tabs="tabConfig">
            <v-layout slot="squad-buffs">
              Squad buffs go here
            </v-layout>
            <v-layout slot="unit-buffs">
              Unit level buffs go here
            </v-layout>
            <v-layout slot="spark-statistics">
              Spark stats go here
            </v-layout>
            <v-layout slot="arena">
              Arena suggestions go here
            </v-layout>
          </tab-container>
        </v-card>
      </v-flex>
      <v-dialog
        :value="!!activeSquadDialog"
        @input="$v => activeSquadDialog = $v ? activeSquadDialog : ''"
        lazy>
        <template v-if="squadCode">
          <share-squad-card
            v-if="activeSquadDialog === 'share'"
            :squad="squad"
            :getUnit="getUnit"
            :getItem="getItem"
            :getExtraSkill="getExtraSkill"
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
import ModuleChecker from '@/components/ModuleChecker';
import LoadingIndicator from '@/components/LoadingIndicator';
import SquadListCard from '@/components/Tools/Squads/SquadListCard';
import ShareSquadCard from '@/components/Tools/Squads/ShareSquadCard';
import DeleteSquadCard from '@/components/Tools/Squads/DeleteSquadCard';
import TabContainer from '@/components/CardTabsContainer';
import SquadListCardEditable from '@/components/Tools/Squads/SquadListCardEditable';

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
  },
  computed: {
    ...mapState('settings', ['activeServer']),
    requiredModules: () => squadRequiredModules,
    tabConfig: () => [
      'Squad Buffs',
      'Unit Buffs',
      'Spark Statistics',
      'Arena',
    ].map(name => ({ name, slot: name.toLowerCase().replace(/ /g, '-') })),
    squadCode () {
      return this.squad ? squadToShorthand(this.squad) : '';
    },
    minimizeSquadActionButtons () {
      return this.$vuetify.breakpoint.xsOnly;
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
    };
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
                this[`squad${name}`] = { ...newDb, ...retrievedEntries };
              } else {
                this[`squad${name}`] = newDb;
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
  },
  watch: {
    squad (newVal) {
      this.setDocumentTitle();
      this.updatePageDbForSquad(newVal);
    },
    editMode (isEditMode) {
      if (isEditMode) {
        this.tempSquad = cloneSquad(this.squad);
      } else {
        this.tempSquad = {};
      }
    },
    tempSquad (newSquad) {
      if (newSquad && Array.isArray(newSquad.units)) {
        this.updatePageDbForSquad(newSquad);
      }
    },
  },
};
</script>

<style>

</style>
