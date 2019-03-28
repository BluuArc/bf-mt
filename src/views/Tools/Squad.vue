<template>
  <module-checker
    :requiredModules="requiredModules"
    :ensureDbSync="true">
    <v-container>
      <v-layout justify-center>
        <v-flex xs12>
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
      </v-layout>
      <h1>This is the squad page for {{ id }} {{ squad }}</h1>
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
} from '@/modules/core/squads';
import ModuleChecker from '@/components/ModuleChecker';
import LoadingIndicator from '@/components/LoadingIndicator';
import SquadListCard from '@/components/Tools/Squads/SquadListCard';
import ShareSquadCard from '@/components/Tools/Squads/ShareSquadCard';
import DeleteSquadCard from '@/components/Tools/Squads/DeleteSquadCard';
import CardTabsContainer from '@/components/CardTabsContainer';
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
    CardTabsContainer,
    SquadListCardEditable,
    LoadingIndicator,
  },
  computed: {
    ...mapState('settings', ['activeServer']),
    requiredModules: () => squadRequiredModules,
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
  },
  watch: {
    squad (newVal) {
      this.setDocumentTitle();
      this.updatePageDbForSquad(newVal);
    },
  },
};
</script>

<style>

</style>
