<template>
  <multidex-data-wrapper>
    <v-container grid-list-sm slot-scope="{ stateInfo, actionInfo, aggregatedInfo, loadingState }" class="multidex-page">
      <span style="display: none">
        {{ setStateVars (stateInfo, actionInfo) }}
        {{ setModuleLoadingState(aggregatedInfo.isLoading) }}
      </span>
      <!-- search card -->
      <template v-if="!loadingState && finishedInit && hasRequiredModules">
        <v-navigation-drawer
          v-if="filterTypes.length > 0"
          persistent right
          enable-resize-watcher
          :clipped="$vuetify.breakpoint.lgAndUp"
          fixed app
          :value="showFilterSheet">
          <v-btn block @click="showFilterSheet = false">
            Close Sidebar
            <v-spacer/>
            <v-icon right>chevron_right</v-icon>
          </v-btn>
          <h3 class="headline pl-3 pt-3">Filters</h3>
        </v-navigation-drawer>
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
                    <v-layout row>
                      <v-flex xs10 class="text-xs-left d-align-self-center">
                        <v-layout>
                          <h2 class="title d-inline-block d-align-self-center">Active Filters</h2>
                          <v-btn icon small flat color="primary">
                            <v-icon>clear</v-icon>
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
                      <v-flex xs10 md11 class="d-align-self-center">
                        <v-chip small style="text-transform: capitalize">Example Filter Chip</v-chip>
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
                      <v-btn v-if="$vuetify.breakpoint.smAndUp" flat icon class="mr-0 pr-1" @click="showSortPanel = !showSortPanel">
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
      </template>
      <!-- results area -->
      <v-layout row>
        <v-flex v-if="loadingState || !finishedInit">
          <loading-indicator :loadingMessage="aggregatedInfo.loadingMessage"/>
        </v-flex>
        <v-flex v-else>
          <result-container
            :dataIsLoading="loadingSorts || loadingFilters"
            :loadingMessage="`${loadingFilters ? 'Filtering' : 'Sorting'} data...`"
            :requiredModules="pageModules"
            :stateInfo="stateInfo"
            :actionInfo="actionInfo"
            :maxResults="stateInfo[mainModule.name].numEntries[activeServer]"
            :numResults="allSortedEntries.length"
            :logger="logger">
            <slot name="results">
              Replace results slot for your data here
            </slot>
          </result-container>
        </v-flex>
      </v-layout>
      <v-layout row>
        {{ activeServer }}
        <br>
        {{ Object.values(pageDb)[0] || 'no page db' }}
      </v-layout>
    </v-container>
  </multidex-data-wrapper>
</template>

<script>
import { Logger } from '@/modules/Logger';
import { moduleInfo } from '@/store/multidex';
import { mapState, mapActions } from 'vuex';
import { servers } from '@/modules/constants';
import { delay } from '@/modules/utils';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import MultidexDataWrapper from '@/components/MultidexDataWrapper';
import LoadingIndicator from '@/components/LoadingIndicator';
import SortOptionsContainer from '@/components/Multidex/SortOptionsContainer';
import ResultContainer from '@/components/Multidex/ResultContainer';

let logger = new Logger({ prefix: '[MULTIDEX/default]' });
function createPropertyMock (name, value) {
  return {
    [name]: () => {
      logger.warn('mock:', name, '=', value);
      return value;
    },
  };
}

const defaultThrottleLength = 1000; // 1 second
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
      type: Object,
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
  },
  components: {
    MultidexDataWrapper,
    LoadingIndicator,
    SortOptionsContainer,
    ResultContainer,
  },
  computed: {
    ...mapState('settings', ['activeServer']),
    ...mapState(['inInitState']),
    ...createPropertyMock('filterTypes', ['elements', 'rarity']),
    logger: () => logger,
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
    hasFilters () {
      return !!this.filterOptions.name;
    },
  },
  data () {
    const showBooleans = {
      showUpdateTooltip: false,
      showUpdateDialog: false,
      showFilterSheet: false,
      showSortPanel: false,
    };
    const pseudoComputed = { // computed based on state
      // toUpdate: [],
      // dbSyncFunctions: null,
      moduleLoadState: true,
      // hasRequiredModules: false,
    };
    const stateVars = {
      stateInfo: null,
      actionInfo: null,
    };
    const resultViewConfig = {
      amountPerPage: 27,
      pageIndex: 0,
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
      filterOptions: {
        name: '',
      },
      loadingFilters: false,
      allSortedEntries: [],
      filteredKeys: [],
    };
  },
  methods: {
    ...mapActions(['setActiveServer']),
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
      this.applyFilters();
    }, 750),
    debounceApplySorts: debounce(function () {
      this.applySorts();
    }, 250),
    async applyFilters () {
      if (this.moduleLoadState || this.inInitState) {
        this.filteredKeys = [];
        return;
      }
      this.loadingFilters = true;
      await delay(0);
      try {
        throw Error('filters not fully implemented');
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
        throw Error('sorts not fully implemented');
      } catch (err) {
        logger.error('SORT', err);
        this.allSortedEntries = this.filteredKeys.slice();
      }
      this.loadingSorts = false;
    },
  },
  watch: {
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
        this.debounceApplyFilters();
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
        await this.applyFilters();
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
  },
  created () {
    logger = new Logger({ prefix: `[MULTIDEX/${this.$route.name}]` });
  },
  mounted () {
    this.conditionalInitDb();
    this.forceSetPseudoComputedValues();

    this.sortOptions.type = Object.keys(this.sortTypes)[0];
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
</style>
