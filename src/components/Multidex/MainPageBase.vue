<template>
  <multidex-data-wrapper>
    <v-container grid-list-sm slot-scope="{ stateInfo, actionInfo, aggregatedInfo, loadingState }" class="multidex-page">
      <span style="display: none">
        {{ setStateVars (stateInfo, actionInfo) }}
        {{ setModuleLoadingState(aggregatedInfo.isLoading) }}
      </span>
      <proc-selector
        :showSelector="showProcSelector"
        @toggleview="showProcSelector = $event"
        :isUnit="isUnit"
        v-model="filterOptions"
        :filterHelper="filterHelper"
      />
      <passive-selector
        :showSelector="showPassiveSelector"
        @toggleview="showPassiveSelector = $event"
        :isUnit="isUnit"
        v-model="filterOptions"
        :filterHelper="filterHelper"
      />
      <!-- search card -->
      <template v-if="!loadingState && finishedInit && hasRequiredModules">
        <filter-options-sidebar
          v-if="filterTypes.length > 0"
          v-model="filterOptions"
          :requiredFilters="filterTypes"
          :disableFilters="loadingState || loadingFilters || loadingSorts"
          :showFilterSheet="showFilterSheet"
          @togglesheet="showFilterSheet = $event"
          :minRarity="minRarity"
          :maxRarity="maxRarity"
          :filterHelper="filterHelper"
          :otherServers="stateInfo[mainModule.name].otherServers"
          :isUnit="isUnit"
          @toggleprocselector="toggleProcSelector"
          @togglepassiveselector="togglePassiveSelector"
        />
        <v-layout row>
          <v-flex>
            <v-card raised>
              <v-card-text>
                <v-container fluid class="pa-0">
                  <v-layout row>
                    <v-flex :xs8="!hasUpdates" :xs6="hasUpdates" :sm7="hasUpdates">
                      <v-text-field v-model="filterOptions.name" clearable label="Search"/>
                    </v-flex>
                    <v-flex xs4 class="text-xs-center d-align-self-center">
                      <span v-text="searchResultCountText"/>
                    </v-flex>
                    <v-flex xs2 sm1 v-if="hasUpdates" class="text-xs-center">
                      <v-tooltip left v-model="showUpdateTooltip">
                        <v-btn flat icon color="info" slot="activator" @click="showUpdateDialog = true">
                          <v-icon>info</v-icon>
                        </v-btn>
                        <span>Updates Available</span>
                      </v-tooltip>
                      <v-dialog v-model="showUpdateDialog" max-width="500px">
                        <v-card>
                          <v-card-text>
                            <h1 class="subheading">
                              Updates are available for this server ({{ activeServer.toUpperCase() }}). ({{ toUpdate.map(m => m.fullName).join(', ') }})
                            </h1>
                          </v-card-text>
                          <v-card-actions>
                            <v-btn flat color="primary" @click="updateData">Download Updates</v-btn>
                            <v-btn color="primary" flat @click.stop="showUpdateDialog = false">Close</v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-dialog>
                    </v-flex>
                  </v-layout>
                  <template v-if="filterTypes.length > 0">
                    <v-layout row>
                      <v-flex>
                        <v-divider/>
                      </v-flex>
                    </v-layout>
                    <v-layout row class="mt-3">
                      <v-flex xs10 class="text-xs-left d-align-self-center">
                        <v-layout>
                          <h2 class="title d-inline-block d-align-self-center">Active Filters</h2>
                          <v-btn icon small flat @click="resetFilters" v-show="hasFilters">
                            <v-icon>highlight_off</v-icon>
                          </v-btn>
                        </v-layout>
                      </v-flex>
                      <v-flex xs2 class="text-xs-right">
                        <v-btn v-if="$vuetify.breakpoint.xsOnly" flat icon class="mr-0 pr-1" @click="showFilterSheet = !showFilterSheet">
                          <v-icon>filter_list</v-icon>
                        </v-btn>
                      </v-flex>
                    </v-layout>
                    <v-layout row>
                      <v-flex xs10 md11 class="d-align-self-center" v-show="hasNonNameFilters">
                        <filter-chip-list
                          :requiredFilters="filterTypes"
                          :filterOptions="filterOptions"
                          :minRarity="minRarity"
                          :maxRarity="maxRarity"
                          :isUnit="isUnit"/>
                      </v-flex>
                      <v-flex xs10 md11 class="d-align-self-center" v-show="!hasNonNameFilters">
                        No filters applied.
                      </v-flex>
                      <v-flex xs2 md1 class="text-xs-right">
                        <v-btn v-if="$vuetify.breakpoint.smAndUp" flat icon class="mr-0 pr-1" @click="showFilterSheet = !showFilterSheet">
                          <v-icon>filter_list</v-icon>
                        </v-btn>
                      </v-flex>
                    </v-layout>
                  </template>
                  <v-layout row>
                    <v-flex>
                      <v-divider/>
                    </v-flex>
                  </v-layout>
                  <v-layout row>
                    <v-flex xs10 md11 class="d-align-self-center">
                      <v-layout>
                        <h2 class="title d-inline d-align-self-center pr-2">Sort</h2>
                        <v-chip small>{{ sortOptions.type }}</v-chip>
                        <v-chip small>{{ sortOptions.isAscending ? 'Ascending' : 'Descending' }}</v-chip>
                      </v-layout>
                    </v-flex>
                    <v-flex xs2 md1 class="text-xs-right">
                      <v-btn flat icon class="mr-0 pr-1" @click="showSortPanel = !showSortPanel">
                        <v-icon>{{ showSortPanel ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
                      </v-btn>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-expansion-panel v-model="sortPanelModel">
                <v-expansion-panel-content>
                  <sort-options-container v-model="sortOptions" :disable-input="loadingSorts" :sort-types="sortTypes"/>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-card>
          </v-flex>
        </v-layout>
        <v-layout row>
          <v-flex xs6>
            <v-btn flat small>Change View</v-btn>
          </v-flex>
          <v-flex xs6 class="text-xs-right">
            <v-menu offset-y :close-on-content-click="false">
              <div slot="activator">
                <span>Page {{ pageIndex + 1 }} of {{ numPages }}</span>
                <v-icon class="pl-1">fas fa-caret-down</v-icon>
              </div>
              <v-card>
                <v-card-text>
                  <v-container fluid class="pa-0">
                    <v-layout row>
                      <v-flex xs6 class="d-align-self-center text-xs-center">
                        Entries Per Page:
                      </v-flex>
                      <v-flex xs6>
                        <v-text-field
                          v-model="amountPerPage"
                          :hide-details="true"
                          solo-inverted
                          type="number"
                          min="1"/>
                      </v-flex>
                    </v-layout>
                    <v-layout row>
                      <v-flex xs6>
                        <v-btn block flat @click="pageIndex = 0">First Page</v-btn>
                      </v-flex>
                      <v-flex xs6>
                        <v-btn block flat @click="pageIndex = numPages - 1">Last Page</v-btn>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>
              </v-card>
            </v-menu>
          </v-flex>
        </v-layout>
        <v-bottom-nav
          v-if="numPages > 1 && !(loadingFilters || loadingSorts)"
          :value="true"
          fixed app>
          <v-pagination
            v-model="paginationModel"
            :total-visible="$vuetify.breakpoint.mdAndUp ? 20 : undefined"
            :length="numPages"/>
        </v-bottom-nav>
      </template>
      <!-- results area -->
      <v-layout row>
        <v-flex v-if="loadingState || !finishedInit">
          <loading-indicator :loadingMessage="aggregatedInfo.loadingMessage"/>
        </v-flex>
        <v-flex v-else>
          <result-container
            class="pa-0"
            :dataIsLoading="loadingSorts || loadingFilters"
            :loadingMessage="`${loadingFilters ? 'Loading' : 'Sorting'} data...`"
            :requiredModules="pageModules"
            :stateInfo="stateInfo"
            :actionInfo="actionInfo"
            :maxResults="stateInfo[mainModule.name].numEntries[activeServer]"
            :numResults="allSortedEntries.length"
            :logger="logger">
            <slot name="results">
              <v-layout row wrap>
                <v-flex
                  v-for="key in entriesToShow"
                  :key="key"
                  xs12 sm6 md4>
                  <v-card :to="getMultidexPathTo(key, activeServer)" v-if="pageDb.hasOwnProperty(key)">
                    <v-card-text>
                      {{ (pageDb[key] && (pageDb[key].name || pageDb[key].description)) || key }}
                    </v-card-text>
                  </v-card>
                </v-flex>
              </v-layout>
            </slot>
          </result-container>
        </v-flex>
        <v-dialog v-model="showEntryDialog" fullscreen hide-overlay transition="dialog-bottom-transition" class="entry-dialog">
          <v-card>
            <v-toolbar fixed class="entry-dialog-toolbar">
              <v-btn icon @click="closeDialog">
                <v-icon>close</v-icon>
              </v-btn>
              <v-toolbar-title>
                <slot name="dialog-toolbar-title">
                  View {{ mainModule.fullName }} Entry
                </slot>
              </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="pl-0 pr-0 entry-dialog-content" v-if="!!viewId">
              <template v-if="!hasViewId">
                <v-container>
                  <v-layout row>
                    <v-flex class="text-xs-center">
                      <h2 class="subheading">
                        Entry with ID {{ viewId }} not found in current server ({{ activeServer.toUpperCase() }}). Would you like to try using a different server?
                      </h2>
                    </v-flex>
                  </v-layout>
                  <v-layout row>
                    <v-flex
                        v-for="(server, i) in servers"
                        :key="i"
                        xs12 sm4
                        class="text-xs-center">
                        <v-btn
                          large
                          :block="$vuetify.breakpoint.xsOnly"
                          :disabled="server === activeServer"
                          v-text="server"
                          :to="getMultidexPathTo(viewId, server)"/>
                      </v-flex>
                  </v-layout>
                  <v-layout row v-if="hasUpdates">
                    <v-flex class="text-xs-center pt-4">
                      <h2 class="subheading">
                        Downloading available updates for this server may give you this missing entry. ({{ toUpdate.map(m => m.fullName).join(', ') }})
                      </h2>
                      <v-btn large @click="updateData">Update Data</v-btn>
                    </v-flex>
                  </v-layout>
                </v-container>
              </template>
              <template v-else>
                <slot name="entry-dialog-content">
                  <p>Put your dialog content here</p>
                  {{ pageDb[viewId] }}
                </slot>
              </template>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-layout>
    </v-container>
  </multidex-data-wrapper>
</template>

<script>
import { Logger } from '@/modules/Logger';
import { moduleInfo } from '@/store/multidex';
import { mapState, mapActions, mapMutations } from 'vuex';
import { servers } from '@/modules/constants';
import { delay } from '@/modules/utils';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import FilterOptionsHelper from '@/modules/FilterOptionsHelper';
import MultidexDataWrapper from '@/components/MultidexDataWrapper';
import LoadingIndicator from '@/components/LoadingIndicator';
import SortOptionsContainer from '@/components/Multidex/SortOptionsContainer';
import ResultContainer from '@/components/Multidex/ResultContainer';
import FilterOptionsSidebar from '@/components/Multidex/Filters/FilterOptionsSidebar';
import FilterChipList from '@/components/Multidex/Filters/FilterChipList';
import ProcSelector from '@/components/Multidex/Filters/BuffSelector/ProcSelector';
import PassiveSelector from '@/components/Multidex/Filters/BuffSelector/PassiveSelector';

let filterHelper = new FilterOptionsHelper();

let logger = new Logger({ prefix: '[MULTIDEX/default]' });
// eslint-disable-next-line no-unused-vars
function createPropertyMock (name, value) {
  return {
    [name]: () => {
      logger.warn('mock:', name, '=', value);
      return value;
    },
  };
}

const defaultThrottleLength = 500; // milliseconds
export default {
  props: {
    requiredModules: {
      type: Array,
      default: () => moduleInfo.map(({name}) => name),
    },
    viewId: {
      type: String,
      default: '',
    },
    routeKey: {
      type: String,
      default: 'multidex-default',
    },
    sortTypes: {
      default: () => {
        return {
          'Data ID': (idA, idB, isAscending) => {
            const result = (+idA - +idB);
            return isAscending ? result : -result;
          },
        };
      },
    },
    inputServer: {
      type: String,
      default: '',
    },
    pageDb: {
      type: Object,
      default: () => {},
    },
    getMultidexPathTo: {
      type: Function,
      required: true,
    },
    dialogCloseLink: {
      type: String,
      default: '',
    },
    filterTypes: {
      type: Array,
      default: () => filterHelper.filterTypes,
    },
    inputFilters: {
      type: Object,
      default: () => {},
    },
    minRarity: {
      type: Number,
      default: 0,
    },
    maxRarity: {
      type: Number,
      default: 8,
    },
    isUnit: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    MultidexDataWrapper,
    LoadingIndicator,
    SortOptionsContainer,
    ResultContainer,
    FilterOptionsSidebar,
    FilterChipList,
    ProcSelector,
    PassiveSelector,
  },
  computed: {
    ...mapState('settings', ['activeServer']),
    ...mapState(['inInitState']),
    logger: () => logger,
    servers: () => servers,
    isDataLoading () {
      return this.moduleLoadState || this.inInitState || !this.finishedInit;
    },
    pageModules () {
      return moduleInfo.filter(m => this.requiredModules.includes(m.name));
    },
    mainModule () {
      if (this.pageModules.length === 0) {
        logger.warn('No page modules specified. Defaulting to module at first index', moduleInfo[0].name);
      }
      return this.pageModules.find(m => m.name === this.requiredModules[0]) || moduleInfo[0];
    },
    hasUpdates () {
      return !!this.toUpdate.find(m => m.name === this.mainModule.name);
    },
    searchResultCountText () {
      return [`Showing ${this.allSortedEntries.length}`, this.mainModule.fullName, this.mainModule.fullName === 'Dictionary' ? 'Entries' : ''].join(' ');
    },
    sortPanelModel () { // used as input for expansion panel v-model
      return this.showSortPanel ? 0 : -1;
    },
    dbSyncFunctions () {
      if (!this.actionInfo) {
        return {};
      }

      const syncFunctions = {};
      this.pageModules.forEach(({name}) => {
        syncFunctions[name] = this.actionInfo[name].dbSync;
      });
      return syncFunctions;
    },
    toUpdate () {
      if (!this.stateInfo) {
        return [];
      }
      logger.debug('setting toUpdate');
      return this.pageModules.filter(m => this.stateInfo[m.name].hasUpdates[this.activeServer]);
    },
    hasRequiredModules () {
      if (!this.stateInfo) {
        return false;
      }
      logger.debug('setting hasRequiredModules');
      return this.pageModules.every(({ name }) => this.stateInfo[name].numEntries[this.activeServer] > 0);
    },
    setStateVars () {
      /* eslint-disable vue/no-side-effects-in-computed-properties */
      return throttle(function (stateInfo, actionInfo) {
        this.stateInfo = stateInfo;
        this.actionInfo = actionInfo;
        // logger.debug('set hasRequiredModules', this.hasRequiredModules);
      }, defaultThrottleLength);
      /* eslint-enable vue/no-side-effects-in-computed-properties */
    },
    numPages () {
      return Math.ceil(this.allSortedEntries.length / this.amountPerPage);
    },
    entriesToShow () {
      const startIndex = this.pageIndex * this.amountPerPage;
      return this.allSortedEntries.slice(startIndex, startIndex + this.amountPerPage);
    },
    hasNonNameFilters () {
      return filterHelper.hasFilters(this.filterOptions);
    },
    hasFilters () {
      return !!this.filterOptions.name || this.hasNonNameFilters;
    },
    hasViewId () {
      return !!this.viewId && this.pageDb.hasOwnProperty(this.viewId);
    },
    useAsyncSort () {
      return Array.isArray(this.sortTypes);
    },
    filterOptionsUrl () {
      return filterHelper.optionsToString(this.filterOptions);
    },
  },
  data () {
    const showBooleans = {
      showUpdateTooltip: false,
      showUpdateDialog: false,
      showFilterSheet: false,
      showSortPanel: false,
      showEntryDialog: false,
      showProcSelector: false,
      showPassiveSelector: false,
    };
    const pseudoComputed = { // manually computed based on current stateVars
      moduleLoadState: true,
    };
    const stateVars = {
      stateInfo: null,
      actionInfo: null,
    };
    const resultViewConfig = {
      amountPerPage: 27,
      pageIndex: 0,
      paginationModel: 0,
      filterHelper,
    };
    const filterOptions = {
      ...filterHelper.defaultValues,
      name: '',
    };
    return {
      finishedInit: false,
      ...resultViewConfig,
      ...showBooleans,
      ...stateVars,
      ...pseudoComputed,
      sortOptions: {
        type: 'ID',
        isAscending: true,
      },
      loadingSorts: false,
      filterOptions,
      loadingFilters: false,
      allSortedEntries: [],
      filteredKeys: [],
      lastKnownFilters: '',
    };
  },
  methods: {
    ...mapActions(['setActiveServer']),
    ...mapMutations(['setHtmlOverflowDisableState']),
    decrementPage () {
      if (this.pageIndex <= 0) {
        this.pageIndex = 0;
      } else {
        this.pageIndex -= 1;
      }
    },
    incrementPage () {
      if (this.pageIndex >= (this.numPages - 1)) {
        this.pageIndex = this.numPages;
      } else {
        this.pageIndex += 1;
      }
    },
    delayedPageIndexChecker: debounce(function () {
      // case for when the user clicks faster than the page can check
      if (this.pageIndex <= 0) {
        this.pageIndex = 0;
      } else if (this.pageIndex >= (this.numPages - 1)) {
        this.pageIndex = this.numPages - 1;
      }
    }, 50),
    async setServerBasedOnInputServer () {
      if (!this.inputServer) {
        return;
      }
      if (!servers.includes(this.inputServer)) {
        logger.warn(`unknown input server [${this.inputServer}]. Auto rerouting to last known valid server`, this.activeServer);
        this.$router.push(this.getMultidexPathTo(this.viewId, this.activeServer));
      } else if (this.inputServer !== this.activeServer) {
        this.finishedInit = false;
        try {
          await this.setActiveServer(this.inputServer);
        } catch (err) {
          logger.error(err);
        }
      }
    },
    conditionalInitDb () {
      logger.debug('checking if can initDb', this.inInitState, this.moduleLoadState, this.finishedInit);
      if (!this.inInitState && !this.moduleLoadState && !this.finishedInit) {
        this.initDb();
      }
    },
    initDb: debounce(async function () {
      logger.debug('starting initDb');
      await this.setServerBasedOnInputServer();
      for (const m of this.pageModules.map(m => m.name)) {
        await this.dbSyncFunctions[m]();
      }
      await delay(0);
      await this.forceSetPseudoComputedValues();
      this.finishedInit = true;
      this.showUpdateTooltip = this.hasUpdates;
    }, 50),
    async updateData () {
      this.logger.debug('starting download for', this.toUpdate);
      for (const mdModule of this.toUpdate) {
        try {
          await this.actionInfo[mdModule.name].update([this.activeServer]);
        } catch (err) {
          this.logger.error(mdModule.fullName, err);
        }
      }
      this.finishedInit = false;
    },
    async forceSetPseudoComputedValues () {
      this.setStateVars.flush();
      this.$forceUpdate();
    },
    setDbSyncFunctions (actionInfo) {
      const syncFunctions = {};
      this.pageModules.forEach(({name}) => {
        syncFunctions[name] = actionInfo[name].dbSync;
      });
      this.dbSyncFunctions = syncFunctions;
    },
    setModuleLoadingState (loadState) {
      this.moduleLoadState = !!loadState;
    },
    debounceApplyFilters: debounce(function () {
      logger.debug('debounce apply filters');
      this.lastKnownFilters = filterHelper.optionsToString(this.filterOptions);
      this.applyFilters();
      this.syncPageSortsToCache();
    }, 750),
    debounceApplySorts: debounce(function () {
      this.applySorts();
      this.syncPageSortsToCache();
    }, 250),
    async applyFilters () {
      if (this.moduleLoadState || this.inInitState) {
        this.filteredKeys = [];
        this.loadingFilters = false;
        return;
      }
      this.loadingFilters = true;
      await delay(0);
      try {
        this.filteredKeys = await this.actionInfo[this.mainModule.name].filter(this.filterOptions);
      } catch (err) {
        logger.error('FILTER', err);
        this.filteredKeys = Object.keys(this.pageDb);
      } finally {
        await this.applySorts();
      }
      this.loadingFilters = false;
    },
    async applySorts () {
      if (this.moduleLoadState || this.inInitState) {
        this.allSortedEntries = [];
        return;
      }

      this.loadingSorts = true;
      await delay(0);
      try {
        if (this.useAsyncSort) {
          this.allSortedEntries = await this.actionInfo[this.mainModule.name].sort({
            ...this.sortOptions,
            keys: this.filteredKeys.slice(),
          });
        } else {
          this.allSortedEntries = this.filteredKeys.slice().sort((a, b) => this.sortTypes[this.sortOptions.type](a, b, this.sortOptions.isAscending));
        }
      } catch (err) {
        logger.error('SORT', err);
        this.allSortedEntries = this.filteredKeys.slice();
      }
      this.loadingSorts = false;
    },
    setShowEntryDialog () {
      this.showEntryDialog = !this.moduleLoadState && !!this.viewId && this.finishedInit && this.hasRequiredModules;
    },
    async resetFilters () {
      const defaultFilterOptions = filterHelper.defaultValues;

      this.filterOptions = {
        ...defaultFilterOptions,
        name: '',
      };
      logger.debug('reset filter options', this.filterOptions, this.filterOptionsUrl);
      this.syncLocalFiltersToUrlFilters(true);
    },
    syncPageSortsToCache () {
      logger.debug('storing sorts', this.sortOptions);
      this.actionInfo[this.mainModule.name].updateSortOptions(JSON.stringify(this.sortOptions));
    },
    syncSortCacheToPage () {
      const sortCache = this.stateInfo && this.stateInfo[this.mainModule.name] && this.stateInfo[this.mainModule.name].sortOptions;
      logger.debug('setting sorts from cache', sortCache);
      if (sortCache !== JSON.stringify(this.sortOptions)) {
        this.sortOptions = {
          ...this.sortOptions,
          ...(JSON.parse(sortCache) || {}),
        };
      }
    },
    syncLocalFiltersToUrlFilters (forcePush = false) {
      if (forcePush || this.stateInfo[this.mainModule.name].filterUrl !== this.filterOptionsUrl) {
        logger.debug('going to new filter options url', this.filterOptionsUrl || undefined);
        this.actionInfo[this.mainModule.name].updateFilterUrl(this.filterOptionsUrl);
        this.$router.replace({
          path: this.$route.path,
          query: {
            viewId: this.viewId || undefined,
            server: this.inputServer || undefined,
            filters: this.filterOptionsUrl || undefined,
          },
        });
      }
    },
    async syncUrlFiltersToLocalFilters (setFilterBool = false) {
      await delay(defaultThrottleLength);
      if (setFilterBool) {
        this.loadingFilters = true;
      }
      await this.forceSetPseudoComputedValues();
      if (Object.keys(this.inputFilters).length > 0) {
        logger.debug('input filters', this.inputFilters);
        this.filterOptions = {
          ...this.filterOptions,
          ...this.inputFilters,
        };
      } else if (this.stateInfo) {
        const cachedFilters = filterHelper.stringToOptions(this.stateInfo[this.mainModule.name].filterUrl);
        this.filterOptions = {
          ...this.filterOptions,
          ...(cachedFilters || {}),
        };
        this.syncLocalFiltersToUrlFilters(true); // update URL
      } else {
        logger.debug('no filter cache found');
        if (setFilterBool) {
          this.loadingFilters = false;
        }
      }
    },
    closeDialog () {
      if (this.dialogCloseLink) {
        this.$router.push(this.dialogCloseLink);
      } else {
        this.$router.push({
          path: this.$route.path,
          query: {
            filters: this.filterOptionsUrl || undefined,
          },
        });
      }
    },
    setDocumentTitle () {
      const defaultTitle = `BF-MT - ${this.mainModule.fullName}`;
      if (this.hasViewId) {
        document.title = [defaultTitle, this.pageDb[this.viewId].name || this.viewId].join(' - ');
      } else if (this.hasFilters) {
        document.title = [defaultTitle, 'Search Results'].join(' - ');
      } else {
        document.title = defaultTitle;
      }
    },
    syncPageIndexToPaginationModel () {
      this.paginationModel = this.pageIndex + 1;
    },
    toggleProcSelector (val) {
      this.showProcSelector = !!val;
    },
    togglePassiveSelector (val) {
      this.showPassiveSelector = !!val;
    },
    setHtmlOverflow () {
      this.setHtmlOverflowDisableState(this.showProcSelector);
    },
  },
  watch: {
    pageIndex () {
      window.scrollTo(0, 0);
      this.delayedPageIndexChecker();
      this.syncPageIndexToPaginationModel();
    },
    paginationModel (newValue) {
      this.pageIndex = newValue - 1;
    },
    hasFilters () {
      this.setDocumentTitle();
    },
    hasUpdates (newValue) {
      this.showUpdateTooltip = !!newValue;
    },
    async showUpdateDialog () {
      await this.forceSetPseudoComputedValues();
    },
    async moduleLoadState (isLoading) {
      if (!isLoading) {
        await this.forceSetPseudoComputedValues();
      } else {
        this.finishedInit = false;
      }
      this.conditionalInitDb();
      this.setShowEntryDialog();
    },
    hasRequiredModules (newValue) {
      if (newValue && this.finishedInit) {
        this.finishedInit = false;
        this.conditionalInitDb();
      }
    },
    inInitState () {
      this.conditionalInitDb();
    },
    filterOptions: {
      deep: true,
      handler () {
        this.pageIndex = 0;
        // filter out invalid rarity values
        if (this.filterOptions.rarity && this.filterOptions.rarity.some(val => val < this.minRarity || val > this.maxRarity)) {
          this.filterOptions.rarity = this.filterOptions.rarity.filter(val => val >= this.minRarity && val <= this.maxRarity);
        } else {
          this.syncLocalFiltersToUrlFilters();
          this.debounceApplyFilters();
        }
      },
    },
    sortOptions: {
      deep: true,
      handler () {
        this.debounceApplySorts();
      },
    },
    async isDataLoading (newValue) {
      if (!newValue) {
        this.loadingFilters = true; // first time filtering data; set true to avoid flickering loading message
        await this.debounceApplyFilters();
      }
    },
    amountPerPage (newValue) {
      this.pageIndex = 0;
      const value = !isNaN(newValue) ? +newValue : 1;
      if (value < 1) {
        this.amountPerPage = 1;
      } else if (value > this.allSortedEntries.length) {
        this.amountPerPage = this.allSortedEntries.length;
      } else {
        this.amountPerPage = value;
      }
    },
    viewId () {
      this.setShowEntryDialog();

      this.setDocumentTitle();
    },
    activeServer () {
      this.setShowEntryDialog();
    },
    stateInfo: {
      deep: true,
      handler (newValue, oldValue) {
        this.setShowEntryDialog();
        if (!oldValue) { // first non-null instance; fires only once
          this.syncUrlFiltersToLocalFilters();
          this.syncSortCacheToPage();
        }
      },
    },
    finishedInit () {
      this.setShowEntryDialog();
    },
    async inputServer (newValue) {
      if (!!newValue && newValue !== this.activeServer) {
        this.finishedInit = false;
        this.showEntryDialog = false;
        await delay(0);
        this.conditionalInitDb();
      }
    },
    inputFilters (newValue, oldValue) {
      const hasChanged = filterHelper.optionsToString(newValue) !== filterHelper.optionsToString(oldValue);
      if (this.finishedInit && hasChanged && !this.showEntryDialog) {
        logger.debug('input filters changed to', newValue);
        this.syncUrlFiltersToLocalFilters(true);
        this.syncSortCacheToPage();
      }
    },
    showProcSelector () {
      this.setHtmlOverflow();
    },
  },
  created () {
    logger = new Logger({ prefix: `[MULTIDEX/${this.$route.name}]` });
    filterHelper = new FilterOptionsHelper(this.minRarity, this.maxRarity);
    this.filterOptions = {
      ...filterHelper.defaultValues,
      name: '',
    };
    this.filterHelper = filterHelper;
    this.syncUrlFiltersToLocalFilters();
    this.syncSortCacheToPage();
  },
  mounted () {
    this.conditionalInitDb();
    this.forceSetPseudoComputedValues();
    this.setShowEntryDialog();
    this.setDocumentTitle();
    this.syncPageIndexToPaginationModel();

    this.sortOptions.type = this.useAsyncSort ? this.sortTypes[0] : Object.keys(this.sortTypes)[0];
    logger.debug('filter types', this.filterTypes);
    logger.todo('implement change view button');
  },
  beforeDestroy () {
    this.setStateVars.cancel();
  },
};
</script>

<style lang="less">
.multidex-page {
  .v-input--radio-group .v-radio {
    flex: 1;
  }
}

.entry-dialog-content {
  // height of top toolbar
  padding-top: 64px;
}
</style>
