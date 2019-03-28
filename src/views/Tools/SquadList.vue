<template>
  <module-checker
    :requiredModules="requiredModules"
    :isExternallyLoading="isVisuallyLoading"
    externalLoadingMessage="Fetching squad information..."
    @initfinished="getDbData">
    <v-container>
      <v-toolbar
        app
        fixed extended
        scroll-off-screen
        extension-height="72px"
      >
        <v-container
          v-show="!showCopyModal"
          fluid
          slot="extension"
          id="squad-list--search-extension"
          :class="{ 'pt-0 pb-0 mb-2 px-1': true, focused: searchIsFocused }">
          <form @submit.prevent="onFilterUpdate">
            <v-layout row align-center>
              <v-flex>
                <v-text-field
                  v-model="nameFilter"
                  @focusin="searchIsFocused = true"
                  @focusout="searchIsFocused = false"
                  clearable
                  :color="lightMode ? 'black' : 'white'"
                  label="Search"
                  prepend-inner-icon="search"
                  :hint="`${sortedSquads.length} ${sortedSquads.length === 1 ? 'squad' : 'squads'}`"
                  persistent-hint
                />
              </v-flex>
              <v-layout row style="flex-grow: 0">
                <v-flex style="flex-grow: 0">
                  <v-btn icon flat @click="sortOrderAscending = !sortOrderAscending">
                    <v-icon>{{ `fa-sort-alpha-${sortOrderAscending ? 'down' : 'up' }` }}</v-icon>
                  </v-btn>
                </v-flex>
                <v-flex style="flex-grow: 0">
                  <v-btn
                    type="submit"
                    @click="onFilterUpdate"
                    :outline="!filterChanged"
                    :color="filterChanged ? 'primary' : ''"
                    style="min-width: 64px;"
                    round>
                    <v-icon>search</v-icon>
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-layout>
          </form>
        </v-container>
      </v-toolbar>
      <v-layout row wrap>
        <v-flex xs12 v-for="(squad, i) in squadsToShow" :key="squad.id">
          <squad-list-card
            :id="`squad-result-${i + 1}`"
            class="ma-2"
            :squad="squad"
            :getUnit="getUnit"
            :getItem="getItem"
            :getExtraSkill="getExtraSkill"
            :to="`/tools/squads/${squad.id}`"
            @share="() => { activeSquadIndex = i; activeSquadDialog = 'share'; }"
            @delete="() => { activeSquadIndex = i; activeSquadDialog = 'delete'; }"
          >
            <template v-if="isCopyMode">
              <v-card-actions slot="card-actions">
                <v-spacer/>
                <v-btn flat :to="getSquadUrl(squad)">
                  <v-icon left>file_copy</v-icon>
                  Copy
                </v-btn>
              </v-card-actions>
            </template>
          </squad-list-card>
        </v-flex>
      </v-layout>
      <v-bottom-nav fixed :value="sortedSquads.length > squadsPerPage" app>
        <v-pagination
          style="justify-content: center;"
          v-model="currentPage"
          :length="numPages"
          :total-visible="$vuetify.breakpoint.mdAndUp ? 20 : undefined"
        />
      </v-bottom-nav>
      <template v-if="!isCopyMode">
        <v-dialog
          :value="!!activeSquadDialog"
          @input="$v => activeSquadDialog = $v ? activeSquadDialog : ''"
          lazy>
          <template v-if="squadsToShow[activeSquadIndex]">
            <share-squad-card
              v-if="activeSquadDialog === 'share'"
              :squad="squadsToShow[activeSquadIndex]"
              :getUnit="getUnit"
              :getItem="getItem"
              :getExtraSkill="getExtraSkill"
              @back="activeSquadDialog = ''"/>
            <delete-squad-card
              v-else-if="activeSquadDialog === 'delete'"
              :squad="squadsToShow[activeSquadIndex]"
              :squadId="squadsToShow[activeSquadIndex].id"
              :getUnit="getUnit"
              :getItem="getItem"
              :getExtraSkill="getExtraSkill"
              @delete="() => { activeSquadDialog = ''; getDbData(); }"
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
        <v-speed-dial
          v-if="!isCopyMode"
          v-model="fabModel"
          transition="slide-y-reverse-transition"
          direction="top"
          right bottom
          fixed>
          <v-btn
            v-model="fabModel"
            @transitionend="() => repositionTooltip()"
            slot="activator"
            color="primary"
            fab>
            <v-icon>add</v-icon>
            <v-icon>close</v-icon>
          </v-btn>
          <v-tooltip
            v-model="showTooltip"
            left>
            <v-btn
              to="/tools/squads/add"
              fab
              small
              outline
              slot="activator">
              <v-icon>add</v-icon>
            </v-btn>
            <span>New Squad</span>
          </v-tooltip>
          <v-tooltip
            v-model="showTooltip"
            left>
            <v-btn
              fab
              small
              outline
              @click="showImportFromCodeModal = true"
              slot="activator">
              <v-icon>input</v-icon>
            </v-btn>
            <span>Import From Code</span>
          </v-tooltip>
          <v-tooltip
            v-model="showTooltip"
            left>
            <v-btn
              fab
              small
              @click="showCopyModal = true"
              outline
              slot="activator">
              <v-icon>file_copy</v-icon>
            </v-btn>
            <span>Copy Existing Squad</span>
          </v-tooltip>
        </v-speed-dial>
        <v-dialog
          v-model="showCopyModal"
          lazy
          fullscreen
          hide-overlay
          transition="dialog-bottom-transition"
        >
          <v-card style="background-color: var(--background-color);">
            <v-toolbar style="z-index: 5;" fixed>
              <v-btn icon @click="showCopyModal = false">
                <v-icon>close</v-icon>
              </v-btn>
              <v-toolbar-title>Copy Existing Squad</v-toolbar-title>
            </v-toolbar>
            <squad-list
              v-if="showCopyModal"
              :isCopyMode="true"
              :squadDb="{ units, items, extraSkills }"
              style="padding-top: 128px; padding-bottom: 64px;"
            />
          </v-card>
        </v-dialog>
        <v-dialog
          v-model="showImportFromCodeModal"
          lazy
          max-width="500px">
          <v-card>
            <v-card-text>
              <v-textarea
                :rows="10"
                v-model="importCode"
                label="Import Code"/>
            </v-card-text>
            <v-card-actions>
              <v-spacer/>
              <v-btn
                :disabled="!importCode"
                flat
                :to="getSquadUrl(importCode)">
                Import
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </template>
    </v-container>
  </module-checker>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { unitPositionMapping, multidexModuleInfo } from '@/modules/constants';
import { ensureContentPadding, delay } from '@/modules/utils';
import { squadRequiredModules } from '@/router/tool-routes';
import { Logger } from '@/modules/Logger';
import { squadToShorthand, getMultidexDatabaseIdsFromSquads } from '@/modules/core/squads';
import debounce from 'lodash/debounce';
import LoadingDebouncer from '@/modules/LoadingDebouncer';
import SquadListCard from '@/components/Tools/Squads/SquadListCard';
import ShareSquadCard from '@/components/Tools/Squads/ShareSquadCard';
import DeleteSquadCard from '@/components/Tools/Squads/DeleteSquadCard';
import ModuleChecker from '@/components/ModuleChecker';

// eslint-disable-next-line no-unused-vars
const logger = new Logger({ prefix: '[SquadList]' });
let loadingDebouncer;
export default {
  name: 'squad-list',
  props: {
    isCopyMode: {
      type: Boolean,
      default: false,
    },
    squadDb: {
      required: false,
    },
  },
  components: {
    SquadListCard,
    ShareSquadCard,
    DeleteSquadCard,
    ModuleChecker,
  },
  computed: {
    ...mapState('settings', ['activeServer', 'lightMode']),
    requiredModules: () => squadRequiredModules,
    squads () {
      return this.$store.state.squads.squads;
    },
    sortedSquads () {
      return Object.freeze(
        this.filteredSquads
          .slice()
          .sort((a, b) => {
            const result = a.name < b.name ? -1 : 1;
            return this.sortOrderAscending ? result : -result;
          })
      );
    },
    squadsPerPage () {
      return 10;
    },
    squadsToShow () {
      const pageIndex = this.currentPage - 1;
      const squadStartIndex = pageIndex * this.squadsPerPage;
      return Object.freeze(this.sortedSquads.slice(squadStartIndex, squadStartIndex + this.squadsPerPage));
    },
    numPages () {
      return Math.ceil(this.sortedSquads.length / this.squadsPerPage);
    },
  },
  data () {
    return {
      units: {},
      items: {},
      extraSkills: {},
      isInternallyLoading: false,
      isVisuallyLoading: false,
      activeCallToken: '0',
      nameFilter: '',
      searchIsFocused: false,
      filterChanged: false,
      sortOrderAscending: true,
      filteredSquads: [],
      currentPage: 1,
      activeSquadIndex: -1,
      activeSquadDialog: '',
      fabModel: false,
      showTooltip: true,
      showCopyModal: false,
      showImportFromCodeModal: false,
      importCode: '',
    };
  },
  beforeCreate () {
    if (loadingDebouncer) {
      loadingDebouncer.dispose();
    }
    loadingDebouncer = new LoadingDebouncer(val => {
      this.isVisuallyLoading = val;
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
    async getDbData () {
      this.isInternallyLoading = true;
      // generate unique value on every call
      const activeCallToken = [(new Date().valueOf()).toString(), Math.random().toString()].join('-');
      this.activeCallToken = activeCallToken;
      if (this.squadDb) {
        this.units = this.squadDb.units;
        this.items = this.squadDb.items;
        this.extraSkills = this.squadDb.extraSkills;
      } else {
        const squads = await this.$store.dispatch('squads/getSquads', this.$store.state.settings.activeServer)
          .then(result => {
            const squads = result.map(s => ({ id: s.id, ...s.squad }));
            this.$store.commit('squads/setSquadList', squads);
            return squads;
          });
        const databaseIds = getMultidexDatabaseIdsFromSquads(squads);
  
        const currentServer = this.activeServer;
        await [
          async () => this.units = await this.getUnits({
            ids: databaseIds.units,
            server: currentServer,
            extractedFields: ['id', 'rarity', 'feskills', 'name', 'sbb', 'cost'],
          }),
          async () => this.items = await this.getItems({
            ids: databaseIds.items,
            server: currentServer,
            extractedFields: ['name', 'sphere type'],
          }),
          async () => this.extraSkills = await this.getExtraSkills({
            ids: databaseIds.extraSkills,
            server: currentServer,
            extractedFields: ['name'],
          }),
        ].reduce((acc, val) => acc.then(() => {
          // only continue if call token is the same
          if (activeCallToken === this.activeCallToken) {
            return val();
          }
        }), Promise.resolve());
      }
      if (activeCallToken === this.activeCallToken) {
        this.isInternallyLoading = false;
      }
    },
    getSampleSquad: () => ({
      id: Math.random().toString().split('.')[1],
      name: `Example Squad ${String.fromCharCode('A'.charCodeAt(0) + (Math.floor(Math.random() * 26)))}`,
      lead: 0,
      friend: 3,
      units: (new Array(6))
        .fill(0)
        .map((_, i) => ({
          position: unitPositionMapping[i],
          id: `${i+1}001${Math.floor(Math.random() * 7) + 1}`,
          es: ((Math.random() > 0.5) && '1013600') || undefined,
          spheres: [(Math.random() > 0.5) && '47410', (Math.random() > 0.5) && '61070'].filter(v => v),
          sp: (((Math.random() > 0.5)) && 'ACDE') || undefined,
          bbOrder: i + 1,
          action: ['bb', 'sbb', 'ubb'][Math.floor(Math.random() * 3)],
        })),
    }),
    getUnit (id) {
      return this.units[id] || {};
    },
    getItem (id) {
      return this.items[id] || {};
    },
    getExtraSkill (id) {
      return this.extraSkills[id] || {};
    },
    // TODO: offload filter into a worker
    filterSquads ({ name = '' } = {}) {
      const lowerCaseName = name && name.toLowerCase();
      const includesName = (n) => (n || '').toLowerCase().includes(lowerCaseName);
      return this.squads.filter(s => {
        return [
          () => !lowerCaseName, // check if name has any values
          () => includesName(s.id.toString()),
          () => s.name && includesName(s.name),
          () => s.units.some(u => [
            () => includesName(this.getUnit(u.id).name),
            () => u.es && includesName(this.getExtraSkill(u.es).name),
            () => Array.isArray(u.spheres) && u.spheres.some(i => includesName(this.getItem(i).name)),
          ].some(v => v())),
        ].some(v => v());
      });
    },
    onFilterUpdate: debounce(function () {
      this.filteredSquads = this.filterSquads({ name: this.nameFilter });
      this.filterChanged = false;
    }, 300),
    repositionTooltip: debounce(async function (forceReposition) {
      if (this.fabModel || forceReposition) {
        await this.$nextTick();
        this.showTooltip = false;
      }
    }, 200),
    getModuleName (internalName) {
      const associatedModule = multidexModuleInfo.find(m => m.name === internalName);
      return associatedModule ? associatedModule.fullName : internalName;
    },
    getSquadUrl (squad) {
      return this.$router.resolve({
        path: '/tools/squads/add',
        query: { import: typeof squad !== 'string' ? squadToShorthand(squad) : squad },
      }).route.fullPath;
    },
  },
  watch: {
    isInternallyLoading () {
      loadingDebouncer.setValue(() => this.isInternallyLoading);
    },
    squads: {
      immediate: true,
      handler () {
        this.onFilterUpdate();
      },
    },
    nameFilter () {
      this.filterChanged = true;
    },
    currentPage () {
      window.scrollTo(0, 0);
    },
    activeSquadDialog (newVal) {
      if (!newVal) {
        this.activeSquadIndex = -1;
      }
    },
    sortedSquads () {
      this.currentPage = 1;
    },
    async showTooltip (isShowing) {
      if (!isShowing) {
        await this.$nextTick();
        this.showTooltip = true;
      }
    },
    async showCopyModal (isShowing) {
      this.$store.commit('setHtmlOverflowDisableState', !!isShowing);

      if (!isShowing) {
        await delay(1000);
        const toolbarHeight = this.$el.querySelector('nav.v-toolbar').offsetHeight;
        // 56px is height of bottom navbar
        ensureContentPadding(toolbarHeight, 56);
      }
    },
  },
};
</script>

<style lang="less">
#squad-list--search-extension {
  background-color: var(--background-color-alt--lighten-1);
  border-radius: 28px;
  transition: border-color 0.25s;
  border: 1px solid var(--background-color-alt--lighten-1);

  &.focused {
    border-color: var(--border-color-alt--lighten-2);
  }

  .v-text-field {
    .v-input__slot {
      margin-bottom: 0;
      &::before, &::after {
        border-width: 0;
      }
    }

    .v-messages {
      padding-left: 28px;
    }
  }
}
</style>
