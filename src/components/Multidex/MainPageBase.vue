<template>
  <v-container grid-list-sm class="multidex-page">
    <proc-selector
      v-if="filterTypes.includes('procs')"
      :showSelector="showProcSelector"
      @toggleview="showProcSelector = $event"
      :isUnit="isUnit"
      v-model="filterOptions"
      :filterHelper="filterHelper"
    />
    <passive-selector
      v-if="filterTypes.includes('passives')"
      :showSelector="showPassiveSelector"
      @toggleview="showPassiveSelector = $event"
      :isUnit="isUnit"
      v-model="filterOptions"
      :filterHelper="filterHelper"
    />
    <lad-selector
      v-if="missionLocationTypes.some(type => filterTypes.includes(type))"
      :showSelector="showLadSelector"
      @toggleview="showLadSelector = $event"
      v-model="filterOptions"
    />
    <!-- search card -->
    <template v-if="!isVisuallyInitializing && hasRequiredModules">
      <filter-options-sidebar
        v-if="filterTypes.length > 0"
        v-model="filterOptions"
        :requiredFilters="filterTypes"
        :disableFilters="isVisuallyLoadingFromOptions"
        :showFilterSheet="showFilterSheet"
        @togglesheet="showFilterSheet = $event"
        :minRarity="minRarity"
        :maxRarity="maxRarity"
        :filterHelper="filterHelper"
        :otherServers="stateInfo[mainModule.name].otherServers"
        :isUnit="isUnit"
        @toggleprocselector="toggleProcSelector"
        @togglepassiveselector="togglePassiveSelector"
        @toggleladselector="toggleLadSelector"
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
                    <v-tooltip left v-model="showUpdateTooltip" v-resize="onResize">
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
                  <v-layout row>
                    <v-flex xs10 class="text-xs-left d-align-self-center">
                      <v-layout>
                        <h2 class="title d-inline-block d-align-self-center">Active Filters</h2>
                        <v-btn icon small flat @click="resetNonNameFilters" v-show="hasNonNameFilters">
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
          <v-btn flat small v-if="onChangeButtonClick" @click="onChangeButtonClick">Change View</v-btn>
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
        <div class="text-xs-center">
          <v-pagination
            v-model="paginationModel"
            :total-visible="$vuetify.breakpoint.mdAndUp ? 20 : undefined"
            :length="numPages"/>
        </div>
      </v-bottom-nav>
      <template v-if="allSortedEntries.length > 0 && allSortedEntries.length < 100 && !(loadingFilters || loadingSorts)">
        <v-dialog
          v-model="showCompareInputDialog"
          max-width="400px"
        >
          <template slot="activator" slot-scope="{ on }">
            <v-btn
              fab fixed
              right bottom
              color="primary"
              v-on="on"
            >
              <v-icon>add</v-icon>
            </v-btn>
          </template>
          <mass-add-compare-entry
            :compareType="compareType"
            :idsToConsider="allSortedEntries"
            :getName="(id) => getCompareName(id, pageDb && pageDb[id])"
            @close="$snackbar => { compareSnackbarOptions = $snackbar; showCompareInputDialog = false; }"
          >
            <template slot="selection" slot-scope="{ selectionId, selectionName }">
              <slot name="compare-input-selection" :selectionId="selectionId" :selectionName="selectionName">
                <span v-text="selectionName"/>
              </slot>
            </template>
          </mass-add-compare-entry>
        </v-dialog>
        <v-snackbar
          v-if="compareSnackbarOptions"
          v-model="compareSnackbarOptions.value"
          color="success"
          bottom
        >
          {{ compareSnackbarOptions.message }}
          <v-btn flat :to="compareSnackbarOptions.link">
            View
          </v-btn>
        </v-snackbar>
      </template>
    </template>

    <!-- results area -->
    <v-layout row>
      <v-flex v-if="isVisuallyInitializing">
        <loading-indicator :loadingMessage="aggregatedLoadingMessage"/>
      </v-flex>
      <v-flex v-else>
        <result-container
          class="pa-0"
          :dataIsLoading="isVisuallyLoadingFromOptions"
          :loadingMessage="`${loadingFilters ? 'Loading' : 'Sorting'} data...`"
          :requiredModules="pageModules"
          :stateInfo="stateInfo"
          :actionInfo="actionInfo"
          :maxResults="stateInfo[mainModule.name].numEntries[activeServer]"
          :numResults="allSortedEntries.length"
          :logger="logger">
          <slot name="results" :logger="logger" :keys="entriesToShow" :getMultidexPathTo="(key) => getMultidexPathTo(key, activeServer).resolved.fullPath">
            <v-layout row wrap>
              <v-flex
                v-for="key in entriesToShow"
                :key="key"
                xs12 sm6 md4 xl3>
                <base-entry-card :to="getMultidexPathTo(key, activeServer).resolved.fullPath" :entry="pageDb[key]" v-if="pageDb.hasOwnProperty(key)">
                  <v-card-text>
                    {{ (pageDb[key] && (pageDb[key].name || pageDb[key].description)) || key }}
                  </v-card-text>
                </base-entry-card>
              </v-flex>
            </v-layout>
          </slot>
        </result-container>
      </v-flex>
      <v-dialog v-model="showEntryDialog" fullscreen hide-overlay lazy transition="dialog-bottom-transition" class="entry-dialog">
        <v-card>
          <v-toolbar fixed class="entry-dialog-toolbar">
            <v-btn icon @click="closeDialog">
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>
              <slot name="dialog-toolbar-title" :viewId="viewId" :hasViewId="hasViewId" :entry="pageDb[viewId]">
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
                      :to="getMultidexPathTo(viewId, server).resolved.fullPath"/>
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
              <slot name="entry-dialog-content" :viewId="viewId" :logger="logger">
                <p>Put your dialog content here</p>
                {{ pageDb[viewId] }}
              </slot>
            </template>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import debounce from 'lodash/debounce';
import { Logger } from '@/modules/Logger';
import { moduleInfo } from '@/store/multidex';
import { generateStateInfo, generateActionInfo, delay } from '@/modules/utils';
import { servers, missionLocationTypes } from '@/modules/constants';
import FilterOptionsHelper from '@/modules/FilterOptionsHelper';
import LoadingIndicator from '@/components/LoadingIndicator';
import ResultContainer from '@/components/Multidex/ResultContainer';
import SortOptionsContainer from '@/components/Multidex/SortOptionsContainer';
import FilterOptionsSidebar from '@/components/Multidex/Filters/FilterOptionsSidebar';
import FilterChipList from '@/components/Multidex/Filters/FilterChipList';
import ProcSelector from '@/components/Multidex/Filters/BuffSelector/ProcSelector';
import PassiveSelector from '@/components/Multidex/Filters/BuffSelector/PassiveSelector';
import BaseEntryCard from '@/components/Multidex/BaseEntryCard';
import LadSelector from '@/components/Multidex/Filters/LandAreaDungeonSelector';
import MassAddCompareEntry from '@/components/Tools/Compare/MassAddCompareEntry';

let filterHelper = new FilterOptionsHelper();
let logger = new Logger({ prefix: '[MULTIDEX/default]' });
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
    getMultidexRouteParamsTo: {
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
    onChangeButtonClick: {
      type: Function,
    },
    onInitDb: {
      type: Function,
    },
    compareType: {
      type: String,
      default: '',
    },
    getCompareName: {
      type: Function,
      default: (id, pageDb) => (pageDb[id] && `${pageDb[id].name} (${id})`) || id,
    },
  },
  components: {
    LoadingIndicator,
    SortOptionsContainer,
    ResultContainer,
    FilterOptionsSidebar,
    FilterChipList,
    ProcSelector,
    PassiveSelector,
    BaseEntryCard,
    LadSelector,
    MassAddCompareEntry,
  },
  computed: {
    ...mapState('settings', ['activeServer']),
    ...mapState({
      inInitState: 'inInitState',
      isStateLoading: 'loadingState',
      updateTimes: 'updateTimes',
    }),
    logger: () => logger,
    servers: () => servers,
    missionLocationTypes: () => missionLocationTypes,
    pageModules () {
      return moduleInfo.filter(m => this.requiredModules.includes(m.name));
    },
    mainModule () {
      if (this.pageModules.length === 0) {
        logger.warn('No page modules specified. Defaulting to module at first index', moduleInfo[0].name);
      }
      return this.pageModules.find(m => m.name === this.requiredModules[0]) || moduleInfo[0];
    },
    stateInfo () {
      return generateStateInfo(this, moduleInfo.filter(m => m.type === 'multidex'));
    },
    actionInfo () {
      return generateActionInfo(this, this.pageModules);
    },
    aggregatedLoadingMessage () {
      return moduleInfo.filter(m => this.stateInfo[m.name] && this.stateInfo[m.name].loadingMessage)
        .map(m => `[${m.fullName}] ${this.stateInfo[m.name].loadingMessage}`)
        .reduce((acc, val) => acc || val, '');
    },
    aggregatedLoadingState () {
      return Object.values(this.stateInfo).reduce((acc, val) => acc || val.isLoading, false);
    },
    toUpdate () {
      const result = this.pageModules.filter(m => this.stateInfo[m.name] && this.stateInfo[m.name].hasUpdates[this.activeServer]);
      logger.debug('setting toUpdate', result);
      return result;
    },
    hasRequiredModules () {
      const result = this.pageModules.every(({ name }) => this.stateInfo[name] && this.stateInfo[name].numEntries[this.activeServer] > 0);
      logger.debug('setting hasRequiredModules', result);
      return result;
    },
    // separate from isVisuallyInitializing
    isInternallyInitializing () {
      return (this.aggregatedLoadingState || this.inInitState || this.isStateLoading);
    },
    // separate from isVisuallyLoadingFromOptions
    isInternallyLoadingFromOptions () {
      return this.loadingFilters || this.loadingSorts;
    },
    searchResultCountText () {
      return [`Showing ${this.allSortedEntries.length}`, this.mainModule.fullName, this.mainModule.fullName === 'Dictionary' ? 'Entries' : ''].join(' ');
    },
    sortPanelModel () { // used as input for expansion panel v-model
      return this.showSortPanel ? 0 : -1;
    },
    numPages () {
      return Math.ceil(this.allSortedEntries.length / this.amountPerPage);
    },
    entriesToShow () {
      const startIndex = this.pageIndex * this.amountPerPage;
      return this.allSortedEntries.slice(startIndex, startIndex + this.amountPerPage);
    },
    hasNonNameFilters () {
      // eslint-disable-next-line no-unused-vars
      const { name, ...filterOptions } = this.filterOptions;
      return filterHelper.hasFilters(filterOptions);
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
    hasUpdates () {
      return !!this.toUpdate.find(m => m.name === this.mainModule.name);
    },
  },
  data () {
    const filterOptions = {
      ...filterHelper.defaultValues,
      name: '',
    };
    const sortOptions = {
      type: 'ID',
      isAscending: true,
    };
    const resultOptions = {
      allSortedEntries: [],
      filteredKeys: [],
    };
    const resultViewConfig = {
      amountPerPage: 36,
      pageIndex: 0,
      paginationModel: 0,
      filterHelper,
    };
    const showBooleans = {
      showUpdateTooltip: false,
      showUpdateDialog: false,
      showFilterSheet: false,
      showSortPanel: false,
      showEntryDialog: false,
      showProcSelector: false,
      showPassiveSelector: false,
      showLadSelector: false,
      showCompareInputDialog: false,
    };
    return {
      sortOptions,
      filterOptions,
      ...resultOptions,
      isVisuallyInitializing: true,
      loadingFilters: false,
      loadingSorts: false,
      hasInitDb: false,
      isVisuallyLoadingFromOptions: false,
      ...resultViewConfig,
      ...showBooleans,
      compareSnackbarOptions: null,
    };
  },
  methods: {
    ...mapActions(['setActiveServer']),
    ...mapMutations(['setHtmlOverflowDisableState']),
    setVisuallyInitializingDebounced: debounce(function (valueGetter) {
      const newValue = !!valueGetter();
      if (this.isVisuallyInitializing !== newValue) {
        this.isVisuallyInitializing = newValue;
      }
    }, 500),
    setVisuallyLoadingFromOptionsDebounced: debounce(function (valueGetter) {
      const newValue = !!valueGetter();
      if (this.isVisuallyLoadingFromOptions !== newValue) {
        this.isVisuallyLoadingFromOptions = newValue;
      }
    }, 500),
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
    initDb: debounce(async function () {
      logger.debug('begin init db');
      if (!this.hasRequiredModules) {
        logger.warn('missing required modules');
        this.hasInitDb = true;
        return;
      }

      await this.setServerBasedOnInputServer();
      if (this.isInternallyInitializing) {
        return;
      }

      for (const m of this.pageModules.map(m => m.name)) {
        await this.actionInfo[m].dbSync();
      }

      if (this.onInitDb) {
        await Promise.resolve(this.onInitDb());
      }

      this.hasInitDb = true;
    }),
    async setServerBasedOnInputServer () {
      if (!this.inputServer) {
        return;
      }
      if (!servers.includes(this.inputServer)) {
        logger.warn(`unknown input server [${this.inputServer}]. Auto rerouting to last known valid server`, this.activeServer);
        this.$router.push(this.getMultidexPathTo(this.viewId, this.activeServer).location);
      } else if (this.inputServer !== this.activeServer) {
        try {
          await this.setActiveServer(this.inputServer);
        } catch (err) {
          logger.error(err);
        }
      }
    },
    getMultidexPathTo (id, server) {
      const { path, query } = this.getMultidexRouteParamsTo(id, server);
      const filters = (path === this.$route.path && this.filterOptionsUrl) ? this.filterOptionsUrl : undefined;
      const resolvedPath = this.$router.resolve({
        path,
        query: {
          ...query,
          filters,
        },
      });
      // logger.debug('resolved path', resolvedPath);
      return resolvedPath;
    },
    setDocumentTitle () {
      const defaultTitle = `BF-MT - ${this.mainModule.fullName}`;
      if (this.viewId) {
        document.title = [defaultTitle, (this.pageDb[this.viewId] && this.pageDb[this.viewId].name) || this.viewId].join(' - ');
      } else if (this.hasFilters) {
        document.title = [defaultTitle, 'Search Results'].join(' - ');
      } else {
        document.title = defaultTitle;
      }
    },
    toggleProcSelector (val) {
      this.showProcSelector = !!val;
    },
    togglePassiveSelector (val) {
      this.showPassiveSelector = !!val;
    },
    toggleLadSelector (val) {
      this.showLadSelector = !!val;
    },
    resetNonNameFilters () {
      const defaultFilterOptions = filterHelper.defaultValues;
      const name = this.filterOptions.name || '';
      this.filterOptions = {
        ...defaultFilterOptions,
        name,
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
    async syncLocalFiltersToUrlFilters (forcePush = false) {
      if (forcePush || this.stateInfo[this.mainModule.name].filterUrl !== this.filterOptionsUrl) {
        logger.debug('going to new filter options url', this.filterOptionsUrl || undefined);
        this.actionInfo[this.mainModule.name].updateFilterUrl(this.filterOptionsUrl);
        this.$router.replace({
          path: this.$route.path,
          query: {
            ...this.$route.query,
            viewId: this.viewId || undefined,
            server: this.inputServer || undefined,
            filters: this.filterOptionsUrl || undefined,
          },
        });
      }
    },
    debounceSyncLocalFiltersToUrlFilters: debounce(function (...args) {
      this.syncLocalFiltersToUrlFilters(...args);
    }, 250),
    async syncUrlFiltersToLocalFilters () {
      if (Object.keys(this.inputFilters).length > 0) {
        // get from url
        logger.debug('input filters', this.inputFilters);
        this.filterOptions = {
          ...this.filterOptions,
          ...this.inputFilters,
        };
      } else if (this.stateInfo) {
        // get from cache
        const cachedFilters = filterHelper.stringToOptions(this.stateInfo[this.mainModule.name].filterUrl);
        this.filterOptions = {
          ...this.filterOptions,
          ...(cachedFilters || {}),
        };
        this.syncLocalFiltersToUrlFilters(true); // update URL
      } else {
        logger.debug('no filter cache found');
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
      this.showEntryDialog = false;
    },
    syncPageIndexToPaginationModel () {
      this.paginationModel = this.pageIndex + 1;
    },
    setHtmlOverflow () {
      this.setHtmlOverflowDisableState(this.showProcSelector || this.showPassiveSelector || this.showLadSelector || this.showEntryDialog);
    },
    onResize: debounce(async function () {
      if (this.showUpdateTooltip) {
        this.showUpdateTooltip = false;
        await this.$nextTick();
        this.showUpdateTooltip = true;
      }
    }, 250),
    async applyFilters () {
      logger.debug('applying filters');
      if (this.isInternallyInitializing) {
        this.filteredKeys = [];
        this.loadingFilters = false;
        return;
      }
      this.loadingFilters = true;
      try {
        this.filteredKeys = await this.actionInfo[this.mainModule.name].filter(this.filterOptions, this.sortOptions);
        this.allSortedEntries = this.filteredKeys.slice(); // sort automatically applied in filter function
      } catch (err) {
        logger.error('FILTER', err);
        this.filteredKeys = Object.keys(this.pageDb);
      }
      this.loadingFilters = false;
    },
    async applySorts () {
      if (this.isInternallyInitializing) {
        this.allSortedEntries = [];
        return;
      }
      this.loadingSorts = true;
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
    debounceApplyFilters: debounce(async function () {
      logger.debug('debounce apply filters');
      this.lastKnownFilters = filterHelper.optionsToString(this.filterOptions);
      await this.applyFilters();
      this.syncPageSortsToCache();
      this.loadingFilters = false;
    }, 750),
    debounceApplySorts: debounce(function () {
      this.applySorts();
      this.syncPageSortsToCache();
    }, 250),
    setShowEntryDialog () {
      this.showEntryDialog = !this.isInternallyInitializing && !!this.viewId && this.hasInitDb && this.hasRequiredModules;
    },
    async updateData () {
      this.logger.debug('starting download for', this.toUpdate);
      this.hasInitDb = false;
      await this.$nextTick();
      for (const mdModule of this.toUpdate) {
        try {
          await this.actionInfo[mdModule.name].update([this.activeServer]);
        } catch (err) {
          this.logger.error(mdModule.fullName, err);
        }
      }
    },
  },
  watch: {
    isInternallyInitializing (newValue) {
      logger.debug('is internally loading', newValue, this.hasRequiredModules);
      if (newValue) {
        this.isVisuallyInitializing = newValue;
      } else {
        this.setVisuallyInitializingDebounced(() => this.isInternallyInitializing);
        this.hasInitDb = false;
        this.initDb();
      }
    },
    async hasInitDb (newValue) {
      this.showUpdateTooltip = this.hasUpdates;
      this.setDocumentTitle();
      this.setShowEntryDialog();
      // db finished initializing
      if (newValue && !this.isInternallyInitializing) {
        this.setVisuallyInitializingDebounced(() => this.isInternallyInitializing);
        
        this.loadingFilters = true; // first time filtering data; set true to avoid flickering loading message
        this.syncSortCacheToPage();
        await this.debounceApplyFilters();
      }
    },
    isVisuallyInitializing (newValue) {
      logger.debug('visual is initializing', newValue);
    },
    isInternallyLoadingFromOptions (newValue) {
      logger.debug('is internally loading from options', newValue);
      if (newValue) {
        this.isVisuallyLoadingFromOptions = newValue;
      } else {
        this.setVisuallyLoadingFromOptionsDebounced(() => this.isInternallyLoadingFromOptions);
      }
    },
    isVisuallyLoadingFromOptions (newValue) {
      logger.debug('visual is loading from options', newValue);
    },
    filterOptions: {
      deep: true,
      handler () {
        this.pageIndex = 0;
        // filter out invalid rarity values
        if (this.filterOptions.rarity && this.filterOptions.rarity.some(val => val < this.minRarity || val > this.maxRarity)) {
          this.filterOptions.rarity = this.filterOptions.rarity.filter(val => val >= this.minRarity && val <= this.maxRarity);
        } else if (typeof this.filterOptions.name !== 'string') {
          this.filterOptions.name = '';
        } else {
          this.debounceSyncLocalFiltersToUrlFilters();
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
    async inputServer (newValue) {
      if (!!newValue && newValue !== this.activeServer) {
        this.showEntryDialog = false;
        this.hasInitDb = false;
        await this.$nextTick();
        if (!this.isInternallyInitializing) {
          this.initDb();
        }
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
    showPassiveSelector () {
      this.setHtmlOverflow();
    },
    async showEntryDialog (isShowing) {
      this.setHtmlOverflow();

      if (!isShowing) {
        // fix for bottom padding going missing after dialog closes
        await delay(1000);
        const vContent = document.querySelector('.application--wrap .v-content');
        if (vContent.style.paddingBottom !== '56px' ) {
          logger.debug('changing padding');
          vContent.style.paddingBottom = '56px';
        }
      }
    },
    showLadSelector () {
      this.setHtmlOverflow();
    },
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
    logger.debug('is internally initializing', this.isInternallyInitializing);
    if (!this.isInternallyInitializing) {
      this.initDb();
    }

    this.sortOptions.type = this.useAsyncSort ? this.sortTypes[0] : Object.keys(this.sortTypes)[0];
    logger.debug('filter types', this.filterTypes);
    this.syncPageIndexToPaginationModel();
  },
};
</script>

<style lang="less">
.multidex-page {
  .v-input--radio-group {
    .v-input__control {
      flex-grow: 1;
    }
    .v-radio {
      flex: 1;
    }
  }
}

.entry-dialog-content {
  // height of top toolbar
  padding-top: 64px;
}
</style>
