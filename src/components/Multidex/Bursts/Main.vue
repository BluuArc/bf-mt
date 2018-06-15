<template>
  <v-container grid-list-sm class="pb-5">
    <v-layout row v-if="isDataLoading || !finishedInit">
      <v-flex xs12 class="pt-5">
        <loading-component :loading-message="pageLoadingMessage"/>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-else>
      <v-flex v-show="hasRequiredModules" xs12>
        <v-card raised class="mr-3 ml-3">
          <v-card-text>
            <v-container fluid class="pa-0">
              <v-layout row>
                <v-flex xs8>
                  <v-text-field v-model="filterOptions.name" label="Search"/>
                </v-flex>
                <v-flex xs4 class="center-align-parent text-xs-center">
                  <span class="center-align-container">Showing {{ allSortedBursts.length }}<br>Brave Bursts</span>
                </v-flex>
              </v-layout>
              <v-layout row>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-expansion-panel>
            <v-expansion-panel-content>
              <div slot="header">
                <v-layout row wrap>
                  <span style="align-self: center">Filters</span>
                  <v-chip small v-show="filterOptions.associatedUnits.length < defaultFilters.associatedUnits.length" style="text-transform: capitalize">
                    {{ filterOptions.associatedUnits[0] }} Associated Units Only
                  </v-chip>
                  <v-chip small v-show="filterOptions.exclusives.length < defaultFilters.exclusives.length" style="text-transform: capitalize">
                    {{ filterOptions.exclusives[0] }}s Only
                  </v-chip>
                </v-layout>
              </div>
              <v-card class="filter-area">
                <v-card-text>
                  <v-layout row wrap class="pl-3 pr-3">
                    <v-flex xs12>
                      <h3 :class="{ subheading: true, 'd-inline': $vuetify.breakpoint.smAndUp }">Associated Units</h3>
                      <v-layout row>
                        <v-radio-group v-model="filterOptions.associatedUnits" :row="$vuetify.breakpoint.mdAndUp">
                          <v-radio
                            :value="associatedUnitOptions.all"
                            label="All"/>
                          <v-radio
                            :value="associatedUnitOptions.with"
                            label="With Associated Units Only"/>
                          <v-radio
                            :value="associatedUnitOptions.without"
                            label="Without Associated Units"/>
                        </v-radio-group>
                      </v-layout>
                    </v-flex>
                  </v-layout>
                  <v-layout row wrap class="pl-3 pr-3">
                    <v-flex xs12>
                      <h3 :class="{ subheading: true, 'd-inline': $vuetify.breakpoint.smAndUp }">Server Exclusives</h3>
                      <p class="mb-0" v-if="!hasOtherServers">Please download data from the <router-link to="/settings" style="color: inherit">Settings Page</router-link> for at least one other server to use this filter.</p>
                      <v-layout row>
                        <v-radio-group v-model="filterOptions.exclusives" :row="$vuetify.breakpoint.mdAndUp">
                          <v-radio
                            :value="exclusiveFilterOptions.all"
                            :disabled="!hasOtherServers"
                            label="All"/>
                          <v-radio
                            :value="exclusiveFilterOptions.exclusive"
                            :disabled="!hasOtherServers"
                            label="Exclusives Only"/>
                          <v-radio
                            :value="exclusiveFilterOptions.nonExclusive"
                            :disabled="!hasOtherServers"
                            label="Non-Exclusives Only"/>
                        </v-radio-group>
                      </v-layout>
                    </v-flex>
                  </v-layout>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
            <v-expansion-panel-content>
              <div slot="header">
                <v-layout row wrap>
                  <span style="align-self: center">Sort</span>
                  <v-chip small>{{ sortOptions.type }}</v-chip>
                  <v-chip small>{{ sortOptions.isAscending ? 'Ascending' : 'Descending' }}</v-chip>
                </v-layout>
              </div>
              <v-card>
                <v-card-text>
                  <v-layout row wrap class="pl-3 pr-3">
                    <v-flex xs12 sm6 md12>
                      <h3 class="subheading">Sort Type</h3>
                      <v-radio-group v-model="sortOptions.type" :row="$vuetify.breakpoint.mdAndUp">
                        <v-radio
                          v-for="(type, i) in Object.keys(sortTypes).sort()"
                          :key="i"
                          :value="type"
                          :label="type"/>
                      </v-radio-group>
                    </v-flex>
                    <v-flex xs12 sm6 md12>
                      <h3 class="subheading">Sort Order</h3>
                      <v-radio-group v-model="sortOptions.isAscending" :row="$vuetify.breakpoint.mdAndUp">
                        <v-radio :value="true" label="Ascending"/>
                        <v-radio :value="false" label="Descending"/>
                      </v-radio-group>
                    </v-flex>
                  </v-layout>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-card>
      </v-flex>
      <v-flex v-show="hasRequiredModules" xs6 class="pl-3">
        <v-btn v-show="hasFilters" flat @click="resetFilters" small class="pa-0">Reset Filters</v-btn>
      </v-flex>
      <v-flex v-show="hasRequiredModules" xs6 class="text-xs-right mt-2 pr-3">
        <v-menu offset-y :close-on-content-click="false">
          <div slot="activator">
            <span>Page {{ pageIndex + 1 }} of {{ numPages }}</span>
            <v-icon>fas fa-caret-down</v-icon>
          </div>
          <v-card>
            <v-card-text>
              <v-container fluid class="pa-0">
                <v-layout row>
                  <v-flex xs6 class="text-xs-center" style="margin: auto">
                    Bursts Per Page:
                  </v-flex>
                  <v-flex xs6 class="text-xs-center">
                    <v-text-field v-model="amountPerPage" solo-inverted type="number" min="1"/>
                  </v-flex>
                </v-layout>
                <v-layout row>
                  <v-flex xs6 class="text-xs-center">
                    <v-btn block flat @click="pageIndex = 0">First Page</v-btn>
                  </v-flex>
                  <v-flex xs6 class="text-xs-center">
                    <v-btn block flat @click="pageIndex = numPages - 1">Last Page</v-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
          </v-card>
        </v-menu>
        <v-btn
          fixed fab bottom left
          :disabled="pageIndex <= 0"
          :small="$vuetify.breakpoint.smAndDown"
          color="primary" @click="decrementPage">
          <span v-show="pageIndex >= 1">
            {{ pageIndex }}
          </span>
        </v-btn>
        <v-btn
          fixed fab bottom right
          :disabled="pageIndex >= (numPages - 1)"
          :small="$vuetify.breakpoint.smAndDown"
          color="primary" @click="incrementPage">
          <span v-show="pageIndex + 1 < numPages">
            {{ pageIndex + 2 }}
          </span>
        </v-btn>
      </v-flex>
      <v-flex xs12 class="text-xs-center pt-5" v-if="loadingFilters">
        <v-progress-circular indeterminate/>
        <h4 class="subheading">Searching for bursts with specified filters.</h4>
      </v-flex>
      <v-flex xs12 v-else>
        <result-viewer
          class="grid-list-lg"
          :max-results="numEntries[activeServer]"
          :num-results="allSortedBursts.length"
          :required-modules="['units', 'bursts']"
          :server-type="activeServer">
          <v-layout row wrap>
            <v-flex
              v-for="key in burstsToShow"
              :key="key"
              xs12 sm6 md4>
              <burst-card
                v-if="pageDb.hasOwnProperty(key)"
                :to="getMultidexPathTo(key)"
                :burst="pageDb[key]"
                style="min-height: 84px; height: 100%;"/>
            </v-flex>
          </v-layout>
        </result-viewer>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-dialog v-model="showDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card>
          <v-toolbar fixed>
            <v-btn icon to="/multidex/bursts">
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>
              <span style="margin-top: auto; margin-bottom: auto;" class="pl-2">
                <span v-if="pageDb[burstId]">
                  {{ pageDb[burstId].name }}
                </span>
                <span v-else-if="burstId">
                  (ID: {{ burstId }})
                </span>
              </span>
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text v-if="burstId" class="pl-0 pr-0 pt-5">
            <burst-info :burstId="burstId"/>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex';
import BurstInfo from '@/components/Multidex/Bursts/BurstDialogContent';
import BurstCard from '@/components/Multidex/Bursts/BurstCard';
import debounce from 'lodash/debounce';
import ResultViewer from '@/components/Multidex/ResultViewer';
import LoadingComponent from '@/components/Multidex/LoadingComponent';

export default {
  props: ['query', 'viewId'],
  components: {
    'burst-info': BurstInfo,
    'burst-card': BurstCard,
    'result-viewer': ResultViewer,
    'loading-component': LoadingComponent,
  },
  computed: {
    ...mapState('bursts', ['pageDb', 'isLoading', 'numEntries', 'activeServer', 'loadingMessage']),
    ...mapState('units', { unitEntries: 'numEntries', unitLoadingMessage: 'loadingMessage' }),
    ...mapGetters('bursts', ['getMultidexPathTo']),
    ...mapState(['inInitState', 'sortAndFilterSettings']),
    pageLoadingMessage () {
      if (this.loadingMessage) {
        return `[${this.$route.name}] ${this.loadingMessage}`;
      } else if (this.unitLoadingMessage) {
        return `[Units] ${this.unitLoadingMessage}`;
      }
    },
    hasOtherServers () {
      return Object.keys(this.numEntries).filter(s => s !== this.activeServer)
        .map(s => this.numEntries[s]).reduce((acc, val) => acc + val, 0) > 0;
    },
    isDataLoading () {
      return this.inInitState || this.isLoading;
    },
    burstId () {
      return this.viewId;
    },
    allSortedBursts () {
      if (this.isDataLoading || this.loadingFilters) {
        return [];
      }

      try {
        const result = this.filteredKeys.slice().sort(this.sortTypes[this.sortOptions.type]);
        return result;
      } catch (err) {
        console.error('error sorting', err);
        return this.filteredKeys;
      }
    },
    numPages () {
      return Math.ceil(this.allSortedBursts.length / this.amountPerPage);
    },
    burstsToShow () {
      const startIndex = this.pageIndex * this.amountPerPage;
      return this.allSortedBursts.slice(startIndex, startIndex + this.amountPerPage);
    },
    sortTypes () {
      return {
        'Burst ID': (idA, idB) => {
          const result = (+idA - +idB);
          return this.sortOptions.isAscending ? result : -result;
        },
        Alphabetical: (idA, idB) => {
          const [nameA, nameB] = [this.pageDb[idA].name, this.pageDb[idB].name];
          const result = (nameA > nameB) ? 1 : -1;
          return this.sortOptions.isAscending ? result : -result;
        },
      };
    },
    defaultFilters () {
      return {
        associatedUnits: this.associatedUnitOptions.all,
        exclusives: this.exclusiveFilterOptions.all,
      };
    },
    exclusiveFilterOptions () {
      return {
        all: ['exclusive', 'non-exclusive'],
        exclusive: ['exclusive'],
        nonExclusive: ['non-exclusive'],
      };
    },
    associatedUnitOptions () {
      return {
        all: ['with', 'without'],
        with: ['with'],
        without: ['without'],
      };
    },
    hasFilters () {
      return !!this.filterOptions.name ||
        Object.keys(this.defaultFilters)
        .map(key => this.filterOptions[key].length !== this.defaultFilters[key].length)
        .reduce((acc, val) => acc || val, false);
    },
    hasRequiredModules () {
      return this.numEntries[this.activeServer] > 0 && this.unitEntries[this.activeServer] > 0;
    },
    routeKey () {
      return `multidex-${this.$route.name}`;
    },
  },
  watch: {
    pageDb () {
      this.pageIndex = 0;
      this.applyFilters();
    },
    amountPerPage (newValue) {
      this.pageIndex = 0;
      const value = !isNaN(newValue) ? +newValue : 1;
      if (value < 1) {
        this.amountPerPage = 1;
      } else if (value > this.allSortedBursts.length) {
        this.amountPerPage = this.allSortedBursts.length;
      } else {
        this.amountPerPage = value;
      }
    },
    pageIndex () {
      window.scrollTo(0, 0);
    },
    isDataLoading (newValue) {
      this.setShowDialog();

      if (!newValue) {
        this.initDb();
        this.applyFilters();
      }
    },
    burstId (newValue) {
      this.setShowDialog();

      if (this.pageDb.hasOwnProperty(newValue)) {
        document.title = `BF-MT - Bursts - ${this.pageDb[newValue].name}`;
      }
    },
    filterOptions: {
      deep: true,
      handler () {
        this.pageIndex = 0;
        this.applyFilters();
      },
    },
    sortOptions: {
      deep: true,
      handler () {
        this.pageIndex = 0;
        this.storeSortAndFilterSettings();
      },
    },
    showDialog (newValue) {
      this.setHtmlOverflow(newValue);
    },
    finishedInit () {
      this.setShowDialog();
    },
    hasRequiredModules (newValue) {
      if (newValue && this.finishedInit) {
        this.finishedInit = false;
        this.initDb();
      }
    },
  },
  data () {
    return {
      pageIndex: 0,
      amountPerPage: 24,
      sortOptions: {
        type: 'Burst ID',
        isAscending: true,
      },
      filterOptions: {
        name: '',
        exclusives: [],
        associatedUnits: [],
      },
      showDialog: false,
      filteredKeys: [],
      loadingFilters: false,
      finishedInit: false,
    };
  },
  created () {
    if (!this.isDataLoading) {
      this.initDb();
    }
  },
  mounted () {
    this.resetFilters();
    if (this.sortAndFilterSettings[this.routeKey]) {
      this.restoreSortAndFilterSettings();
    }
    this.setShowDialog();
  },
  methods: {
    ...mapMutations(['setHtmlOverflow', 'setSortAndFilterSettings']),
    ...mapActions('bursts', ['getFilteredKeys', 'ensurePageDbSyncWithServer']),
    ...mapActions('units', { unitsDbSync: 'ensurePageDbSyncWithServer' }),
    restoreSortAndFilterSettings () {
      if (!this.sortAndFilterSettings[this.routeKey]) {
        return;
      }

      try {
        const { filter, sort } = this.sortAndFilterSettings[this.routeKey];
        Object.keys(filter).forEach(key => {
          this.filterOptions[key] = filter[key].slice();
        });

        if (this.filterOptions.exclusives.length === 2) {
          this.filterOptions.exclusives = this.exclusiveFilterOptions.all;
        } else {
          const elem = this.filterOptions.exclusives[0];
          this.filterOptions.exclusives = this.exclusiveFilterOptions[(elem === this.exclusiveFilterOptions.exclusive[0]) ? 'exclusive' : 'nonExclusive'];
        }

        if (this.filterOptions.associatedUnits.length === 2) {
          this.filterOptions.associatedUnits = this.associatedUnitOptions.all;
        } else {
          const elem = this.filterOptions.associatedUnits[0];
          this.filterOptions.associatedUnits = this.associatedUnitOptions[(elem === this.associatedUnitOptions.with[0]) ? 'with' : 'without'];
        }

        this.filterOptions.forceUpdate = true;

        ({ type: this.sortOptions.type, isAscending: this.sortOptions.isAscending } = sort);
      } catch (err) {
        console.error(err);
        this.resetFilters();
      } finally {
        this.applyFilters();
      }
    },
    storeSortAndFilterSettings () {
      const filterCopy = {};
      const { forceUpdate, ...filters } = this.filterOptions;
      Object.keys(filters)
        .forEach(key => {
          filterCopy[key] = this.filterOptions[key].slice();
        });

      const { ...sortCopy } = this.sortOptions;
      this.setSortAndFilterSettings({ key: this.routeKey, filter: filterCopy, sort: sortCopy });
    },
    setShowDialog () {
      this.showDialog = !this.isDataLoading && !!this.viewId && this.finishedInit && this.hasRequiredModules;
    },
    initDb: debounce(async function () {
      await this.unitsDbSync();
      await this.ensurePageDbSyncWithServer();
      this.finishedInit = true;
    }, 50),
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
    applyFilters () {
      this.filteredKeys = [];
      this.applyFiltersHelper();
    },
    applyFiltersHelper: debounce(async function () {
      if (Object.keys(this.pageDb).length === 0) {
        this.filteredKeys = [];
        return;
      }
      this.loadingFilters = true;
      this.filteredKeys = await this.getFilteredKeys(this.filterOptions);
      delete this.filterOptions.forceUpdate;
      this.storeSortAndFilterSettings();
      this.loadingFilters = false;
    }, 250),
    resetFilters () {
      Object.keys(this.defaultFilters).forEach(key => {
        this.filterOptions[key] = this.defaultFilters[key].slice();
      });
      this.filterOptions.exclusives = this.defaultFilters.exclusives;
      this.filterOptions.associatedUnits = this.defaultFilters.associatedUnits;
      this.filterOptions.name = '';
    },
  },
};
</script>
