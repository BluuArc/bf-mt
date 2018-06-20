<template>
  <v-container grid-list-sm class="pb-5">
    <v-layout row v-if="isDataLoading || !finishedInit">
      <v-flex xs12 class="pt-5">
        <loading-component :loading-message="pageLoadingMessage"/>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-else>
      <template v-show="hasRequiredModules">
        <v-flex xs12>
          <v-card raised class="mr-3 ml-3">
            <v-card-text>
              <v-container fluid class="pa-0">
                <v-layout row>
                  <v-flex xs8>
                    <v-text-field v-model="filterOptions.name" label="Search"/>
                  </v-flex>
                  <v-flex xs4 class="center-align-parent text-xs-center">
                    <span class="center-align-container">Showing {{ allSortedEntries.length }}<br>{{ mainModule.fullName }}</span>
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
                    <v-chip small v-show="filterOptions.element.length < defaultFilters.element.length" style="text-transform: capitalize">
                      <span v-if="filterOptions.element.length === 0">
                        No Elements
                      </span>
                      <span v-else>
                        <element-icon v-for="element in filterOptions.element" :element="element" :key="element" class="ml-1"/>
                        <span v-if="filterOptions.element.length === 1">Only</span>
                      </span>
                    </v-chip>
                    <v-chip small v-show="filterOptions.rarity.length < defaultFilters.rarity.length" style="text-transform: capitalize">
                      <span v-if="filterOptions.rarity.length === 1">
                        <span v-if="filterOptions.rarity[0] < 8">
                          <b>{{ filterOptions.rarity[0] }}</b>
                          <img class="icon bf" src="@/assets/star_rare.png" height="18px" style="margin-top: -0.25rem;"/>
                        </span>
                        <img v-else class="icon bf" src="@/assets/phantom_icon.png" height="18px"/>
                        Only
                      </span>
                      <span v-else-if="filterOptions.rarity.length === 0">
                        No rarity
                      </span>
                      <span v-else>
                        {{ filterOptions.rarity.length }} Different Rarities
                      </span>
                    </v-chip>
                    <v-chip small v-show="filterOptions.kind.length < defaultFilters.kind.length" style="text-transform: capitalize">
                      <span v-if="filterOptions.kind.length === 0">
                        No Types
                      </span>
                      <span v-else-if="filterOptions.kind.length === 1">
                        {{ filterOptions.kind[0] }} Only
                      </span>
                      <span v-else>
                        {{ filterOptions.kind.length }} Types
                      </span>
                    </v-chip>
                    <v-chip small v-show="filterOptions.gender.length < defaultFilters.gender.length" style="text-transform: capitalize">
                      <span v-if="filterOptions.gender.length === 0">
                        No Genders
                      </span>
                      <span v-else>
                        <v-icon v-for="gender in filterOptions.gender" :key="gender" :color="getGenderInfo(gender).color">fas {{ getGenderInfo(gender).icon }}</v-icon>
                        <span v-if="filterOptions.gender.length === 1">Only</span>
                      </span>
                    </v-chip>
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
                    <v-container fluid class="pa-0">
                      <v-layout row wrap>
                        <v-flex xs12>
                          <h3 :class="{ subheading: true, 'd-inline': $vuetify.breakpoint.smAndUp }">Element</h3>
                          <v-btn outline class="mr-0" @click="filterOptions.element = defaultFilters.element.slice()">All</v-btn>
                          <v-btn outline class="ml-0" @click="filterOptions.element = []">None</v-btn>
                          <v-layout row wrap>
                            <v-flex xs4 sm2 v-for="(element, i) in defaultFilters.element" :key="i">
                              <v-checkbox :value="element" v-model="filterOptions.element">
                                <div slot="label">
                                  <element-icon :element="element" class="ml-2"/>
                                </div>
                              </v-checkbox>
                            </v-flex>
                          </v-layout>
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex xs12>
                          <h3 :class="{ subheading: true, 'd-inline': $vuetify.breakpoint.smAndUp }">Rarity</h3>
                          <v-btn outline class="mr-0" @click="filterOptions.rarity = defaultFilters.rarity.slice()">All</v-btn>
                          <v-btn outline class="ml-0" @click="filterOptions.rarity = []">None</v-btn>
                          <v-layout row wrap>
                            <v-flex xs4 sm2 v-for="(rarity, i) in defaultFilters.rarity" :key="i">
                              <v-checkbox :value="rarity" v-model="filterOptions.rarity">
                                <div slot="label">
                                  <span v-if="rarity < 8">
                                    <h3 class="subheading d-inline-block">{{ rarity }}</h3>
                                    <img class="icon bf" src="@/assets/star_rare.png" height="18px" style="margin-top: -0.25rem;"/>
                                  </span>
                                  <img v-else class="icon bf" src="@/assets/phantom_icon.png" height="18px"/>
                                </div>
                              </v-checkbox>
                            </v-flex>
                          </v-layout>
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex xs12>
                          <h3 :class="{ subheading: true, 'd-inline': $vuetify.breakpoint.smAndUp }">Type</h3>
                          <v-btn outline class="mr-0" @click="filterOptions.kind = defaultFilters.kind.slice()">All</v-btn>
                          <v-btn outline class="ml-0" @click="filterOptions.kind = []">None</v-btn>
                          <v-layout row wrap>
                            <v-flex xs6 sm3 v-for="(kind, i) in defaultFilters.kind" :key="i">
                              <v-checkbox :value="kind" v-model="filterOptions.kind">
                                <div slot="label">
                                  <span style="text-transform: capitalize">{{ kind }}</span>
                                </div>
                              </v-checkbox>
                            </v-flex>
                          </v-layout>
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex xs12>
                          <h3 :class="{ subheading: true, 'd-inline': $vuetify.breakpoint.smAndUp }">Gender</h3>
                          <v-btn outline class="mr-0" @click="filterOptions.gender = defaultFilters.gender.slice()">All</v-btn>
                          <v-btn outline class="ml-0" @click="filterOptions.gender = []">None</v-btn>
                          <v-layout row wrap>
                            <v-flex xs4 sm2 v-for="(gender, i) in defaultFilters.gender" :key="i">
                              <v-checkbox :value="gender" v-model="filterOptions.gender">
                                <div slot="label">
                                  <v-icon :color="getGenderInfo(gender).color">fas {{ getGenderInfo(gender).icon }}</v-icon>
                                </div>
                              </v-checkbox>
                            </v-flex>
                          </v-layout>
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex xs12>
                          <h3 :class="{ subheading: true, 'd-inline': $vuetify.breakpoint.smAndUp }">Associated Units</h3>
                          <v-layout row>
                            <v-radio-group v-model="filterOptions.associatedUnits" :row="$vuetify.breakpoint.mdAndUp">
                              <v-radio
                                :value="knownConstants.associatedUnitOptions.all"
                                label="All"/>
                              <v-radio
                                :value="knownConstants.associatedUnitOptions.with"
                                label="With Associated Units Only"/>
                              <v-radio
                                :value="knownConstants.associatedUnitOptions.without"
                                label="Without Associated Units"/>
                            </v-radio-group>
                          </v-layout>
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex xs12>
                          <h3 :class="{ subheading: true, 'd-inline': $vuetify.breakpoint.smAndUp }">Server Exclusives</h3>
                          <p class="mb-0" v-if="!hasOtherServers">Please download data from the <router-link to="/settings" style="color: inherit">Settings Page</router-link> for at least one other server to use this filter.</p>
                          <v-layout row>
                            <v-radio-group v-model="filterOptions.exclusives" :row="$vuetify.breakpoint.mdAndUp">
                              <v-radio
                                :value="knownConstants.exclusiveFilterOptions.all"
                                :disabled="!hasOtherServers"
                                label="All"/>
                              <v-radio
                                :value="knownConstants.exclusiveFilterOptions.exclusive"
                                :disabled="!hasOtherServers"
                                label="Exclusives Only"/>
                              <v-radio
                                :value="knownConstants.exclusiveFilterOptions.nonExclusive"
                                :disabled="!hasOtherServers"
                                label="Non-Exclusives Only"/>
                            </v-radio-group>
                          </v-layout>
                        </v-flex>
                      </v-layout>
                    </v-container>
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
        <v-flex xs6 class="pl-3">
          <v-btn v-show="hasFilters" flat @click="resetFilters" small class="pa-0">Reset Filters</v-btn>
        </v-flex>
        <v-flex xs6 class="text-xs-right mt-2 pr-3">
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
                      Entries Per Page:
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
          <h4 class="subheading">Searching for entries with specified filters.</h4>
        </v-flex>
      </template>
      <v-flex xs12 v-if="!loadingFilters">
        <result-viewer
          class="grid-list-lg"
          :max-results="moduleStateInfo[mainModule.name].numEntries[activeServer]"
          :num-results="allSortedEntries.length"
          :required-modules="requiredModules"
          :server-type="activeServer">
          <slot name="results-area">
            Put your result code here.
            <v-layout row wrap>
              <v-flex
                v-for="key in entriesToShow"
                :key="key"
                xs12 sm6 md4>
                <v-card :to="getMultidexPathTo(key, activeServer)" v-if="pageDb.hasOwnProperty(key)">
                  <v-card-text>
                    {{ pageDb[key].name || pageDb[key].description || key }}
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
          </slot>
        </result-viewer>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-dialog v-model="showDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card>
          <v-toolbar fixed>
            <v-btn icon :to="dialogCloseLink || $route.path">
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>
              <slot name="dialog-toolbar-title">
                <span style="margin-top: auto; margin-bottom: auto;" class="pl-2">
                  <span v-if="pageDb[viewId]">
                    {{ pageDb[viewId].name }}
                  </span>
                  <span v-else-if="viewId">
                    (ID: {{ viewId }})
                  </span>
                </span>
              </slot>
            </v-toolbar-title>
          </v-toolbar>
          <template v-if="viewId">
            <v-card-text v-if="!pageDb[viewId]" class="pl-0 pr-0 pt-5">
              <v-card flat>
                <v-card-text>
                  <v-container>
                    <v-layout row wrap>
                      <v-flex xs12 class="text-xs-center">
                        <h3 class="subheading">
                          Entry with ID {{ viewId }} not found in current server ({{ activeServer.toUpperCase() }}). Would you like to try using a different server?
                        </h3>
                      </v-flex>
                    </v-layout>
                    <v-layout row wrap class="pt-2">
                      <v-flex
                        v-for="(server, i) in knownConstants.servers"
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
                  </v-container>
                </v-card-text>
              </v-card>
            </v-card-text>
            <v-card-text v-else class="pl-0 pr-0 pt-5">
              <slot name="dialog-content">
                <v-card flat>
                  <v-card-text>
                    <p>Put your dialog content here.</p>

                    {{ pageDb[viewId] }}
                  </v-card-text>
                </v-card>
              </slot>
            </v-card-text>
          </template>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<script>
import { moduleInfo } from '@/store';
import { knownConstants } from '@/store/modules/db.common';
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex';
import debounce from 'lodash/debounce';
import ResultViewer from '@/components/Multidex/ResultViewer';
import LoadingComponent from '@/components/Multidex/LoadingComponent';
import ElementIcon from '@/components/Multidex/Units/ElementIcon';

const multidexModules = moduleInfo.filter(m => m.type === 'multidex');
export default {
  props: {
    requiredModules: {
      type: Array,
      default: () => [],
    },
    defaultAmountPerPage: {
      type: Number,
      default: 27,
    },
    viewId: {
      type: String,
      default: '',
    },
    routeKey: {
      type: String,
      default: 'multidex-default',
    },
    pageDb: {
      type: Object,
      default: () => {},
    },
    maxRarity: {
      type: Number,
      default: 8,
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
    filterTypes: {
      type: Array,
      default: () => ['rarity', 'gender', 'kind', 'sphereTypes', 'itemTypes', 'associatedUnits', 'craftables', 'usage', 'exclusives'],
    },
    dialogCloseLink: {
      type: String,
      default: '',
    },
    inputServer: {
      type: String,
      default: '',
    },
    getMultidexPathTo: {
      type: Function,
      required: true,
    },
  },
  components: {
    'result-viewer': ResultViewer,
    'loading-component': LoadingComponent,
    'element-icon': ElementIcon,
  },
  computed: {
    ...mapState('settings', ['activeServer']),
    ...mapState(['inInitState', 'sortAndFilterSettings']),
    ...(() => {
      // get state for each module
      let result = {};
      multidexModules.map(m => m.name).forEach(m => {
        const stateMapping = {};
        stateMapping[`${m}IsLoading`] = 'isLoading';
        stateMapping[`${m}LoadingMessage`] = 'loadingMessage';
        stateMapping[`${m}NumEntries`] = 'numEntries';

        const getterMapping = {};
        getterMapping[`${m}GetMultidexPathTo`] = 'getMultidexPathTo';

        result = {
          ...result,
          ...mapState(m, stateMapping),
          ...mapGetters(m, getterMapping),
        };
      });
      return result;
    })(),
    knownConstants: () => knownConstants,
    pageModules () {
      return multidexModules.filter(m => this.requiredModules.includes(m.name));
    },
    mainModule () {
      if (!this.pageModules.length === 0) {
        console.warn('No page modules specified. Defaulting to module at first index.', multidexModules[0]);
      }
      return this.pageModules[0] || multidexModules[0];
    },
    hasOtherServers () {
      const numEntriesStatsForCurrentModule = this.moduleStateInfo[this.mainModule.name].numEntries;
      return Object.keys(numEntriesStatsForCurrentModule).filter(s => s !== this.activeServer)
        .map(s => numEntriesStatsForCurrentModule[s]).reduce((acc, val) => acc + val, 0) > 0;
    },
    moduleStateInfo () {
      const result = {};
      this.pageModules.map(m => m.name)
        .forEach(m => {
          result[m] = {
            isLoading: this[`${m}IsLoading`],
            loadingMessage: this[`${m}LoadingMessage`],
            numEntries: this[`${m}NumEntries`],
            getMultidexPathTo: this[`${m}GetMultidexPathTo`],
          };
        });
      return result;
    },
    isDataLoading () {
      return this.inInitState || (Object.values(this.moduleStateInfo).map(s => s.isLoading).reduce((acc, val) => acc || val, false));
    },
    pageLoadingMessage () {
      return this.pageModules
        .filter(m => this.moduleStateInfo[m.name].loadingMessage)
        .map(m => `[${m.fullName}] ${this.moduleStateInfo[m.name].loadingMessage}`)
        .reduce((acc, val) => acc || val, '');
    },
    totalEntries () {
      return this.pageModules
        .map(m => this.moduleStateInfo[m.name].numEntries[this.activeServer])
        .reduce((acc, val) => acc + val, 0);
    },
    hasRequiredModules () {
      return this.totalEntries > 0;
    },
    allSortedEntries () {
      if (this.isDataLoading || this.loadingFilters) {
        return [];
      }
      try {
        const result = this.filteredKeys.slice().sort((a, b) => this.sortTypes[this.sortOptions.type](a, b, this.sortOptions.isAscending));
        return result;
      } catch (err) {
        console.error('error sorting', err);
        return this.filteredKeys;
      }
    },
    numPages () {
      return Math.ceil(this.allSortedEntries.length / this.amountPerPage);
    },
    entriesToShow () {
      const startIndex = this.pageIndex * this.amountPerPage;
      return this.allSortedEntries.slice(startIndex, startIndex + this.amountPerPage);
    },
    defaultFilters () {
      return {
        element: knownConstants.elements.slice(),
        rarity: Object.keys(new Array(this.maxRarity).fill(0)).map(i => +i + 1),
        gender: knownConstants.gender.slice(),
        kind: knownConstants.unitKind.slice(),
        sphereTypes: Object.keys(new Array(15).fill(0)).map(i => +i),
        itemTypes: knownConstants.itemTypes.slice(),
        associatedUnits: knownConstants.associatedUnitOptions.all,
        craftables: knownConstants.craftableFilterOptions.all,
        usage: knownConstants.usageFilterOptions.all,
        exclusives: knownConstants.exclusiveFilterOptions.all,
      };
    },
    hasFilters () {
      return !!this.filterOptions.name ||
        Object.keys(this.defaultFilters)
        .map(key => this.filterOptions[key].length !== this.defaultFilters[key].length)
        .reduce((acc, val) => acc || val, false);
    },
  },
  data () {
    return {
      pageIndex: 0,
      amountPerPage: 27,
      showDialog: false,
      filteredKeys: [],
      loadingFilters: false,
      finishedInit: false,
      sortOptions: {
        type: 'ID',
        isAscending: true,
      },
      filterOptions: {
        name: '',
        rarity: [],
        gender: [],
        kind: [],
        sphereTypes: [],
        itemTypes: [],
        associatedUnits: [],
        craftables: [],
        usage: [],
        exclusives: [],
      },
    };
  },
  watch: {
    totalEntries () {
      this.pageIndex = 0;
      this.applyFilters();
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
    pageIndex () {
      window.scrollTo(0, 0);
      this.delayedPageIndexChecker();
    },
    isDataLoading (newValue) {
      this.setShowDialog();

      if (!newValue) {
        this.initDb();
        this.applyFilters();
      }
    },
    viewId (newValue) {
      this.setShowDialog();
      const entry = this.pageDb.hasOwnProperty(newValue) ? this.pageDb[newValue] : {};
      document.title = `BF-MT - ${this.mainModule.fullName} - ${entry.name || newValue}`;
    },
    async inputServer (newValue) {
      this.setServerBasedOnInputServer();
    },
    activeServer () {
      this.setShowDialog();
    },
    moduleStateInfo: {
      deep: true,
      handler () {
        this.setShowDialog();
      },
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
  created () {
    if (!this.isDataLoading) {
      this.initDb();
    }
  },
  beforeMount () {
    if (this.defaultAmountPerPage !== this.amountPerPage) {
      this.amountPerPage = this.defaultAmountPerPage;
    }
  },
  mounted () {
    if (!this.isDataLoading && !this.finishedInit) {
      this.initDb();
    }

    this.resetFilters();
    if (this.sortAndFilterSettings[this.routeKey]) {
      this.restoreSortAndFilterSettings();
    } else {
      this.sortOptions.type = Object.keys(this.sortTypes)[0];
    }
    this.setShowDialog();
  },
  methods: {
    ...mapMutations(['setHtmlOverflow', 'setSortAndFilterSettings']),
    ...mapActions(['setActiveServer']),
    ...(() => {
      // get actions for each module
      let result = {};
      multidexModules.map(m => m.name).forEach(m => {
        const actionMapping = {};
        actionMapping[`${m}DbSync`] = 'ensurePageDbSyncWithServer';
        actionMapping[`${m}GetFilteredKeys`] = 'getFilteredKeys';
        result = {
          ...result,
          ...mapActions(m, actionMapping),
        };
      });
      return result;
    })(),
    async setServerBasedOnInputServer () {
      if (!knownConstants.servers.includes(this.inputServer)) {
        console.error('Unknown server', this.inputServer, 'Auto rerouting to last known valid server', this.activeServer);
        this.$router.push(this.getMultidexPathTo(this.viewId, this.activeServer));
      } else if (this.inputServer !== this.activeServer) {
        this.finishedInit = false;
        try {
          await this.setActiveServer(this.inputServer);
        } catch (err) {
          console.error(err);
        }
      }
    },
    setShowDialog () {
      this.showDialog = !this.isDataLoading && !!this.viewId && this.finishedInit && this.hasRequiredModules;
    },
    initDb: debounce(async function () {
      await this.setServerBasedOnInputServer();

      for (const m of this.pageModules.map(m => m.name)) {
        await this[`${m}DbSync`]();
      }
      this.finishedInit = true;
    }, 50),
    applyFilters () {
      this.filteredKeys = [];
      this.applyFiltersHelper();
    },
    applyFiltersHelper: debounce(async function () {
      const currentDbIsEmpty = this.moduleStateInfo[this.mainModule.name].numEntries[this.activeServer] === 0;
      if (currentDbIsEmpty) {
        console.debug('current db is empty');
        this.filteredKeys = [];
        return;
      }

      this.loadingFilters = true;
      this.filteredKeys = await this[`${this.mainModule.name}GetFilteredKeys`](this.filterOptions);
      delete this.filterOptions.forceUpdate;
      this.storeSortAndFilterSettings();
      this.loadingFilters = false;
    }, 250),
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
          this.filterOptions.exclusives = knownConstants.exclusiveFilterOptions.all;
        } else {
          const elem = this.filterOptions.exclusives[0];
          this.filterOptions.exclusives = knownConstants.exclusiveFilterOptions[(elem === knownConstants.exclusiveFilterOptions.exclusive[0]) ? 'exclusive' : 'nonExclusive'];
        }

        if (this.filterOptions.associatedUnits.length === 2) {
          this.filterOptions.associatedUnits = knownConstants.associatedUnitOptions.all;
        } else {
          const elem = this.filterOptions.associatedUnits[0];
          this.filterOptions.associatedUnits = knownConstants.associatedUnitOptions[(elem === knownConstants.associatedUnitOptions.with[0]) ? 'with' : 'without'];
        }

        if (this.filterOptions.craftables.length === 2) {
          this.filterOptions.craftables = knownConstants.craftableFilterOptions.all;
        } else {
          const elem = this.filterOptions.craftables[0];
          this.filterOptions.craftables = knownConstants.craftableFilterOptions[(elem === knownConstants.craftableFilterOptions.craftable[0]) ? 'craftable' : 'nonCraftable'];
        }

        if (this.filterOptions.usage.length === 2) {
          this.filterOptions.usage = knownConstants.usageFilterOptions.all;
        } else {
          const elem = this.filterOptions.usage[0];
          this.filterOptions.usage = knownConstants.usageFilterOptions[(elem === knownConstants.usageFilterOptions.used[0]) ? 'used' : 'unused'];
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
    resetFilters () {
      Object.keys(this.defaultFilters).forEach(key => {
        this.filterOptions[key] = this.defaultFilters[key].slice();
      });
      this.filterOptions.exclusives = this.defaultFilters.exclusives;
      this.filterOptions.associatedUnits = this.defaultFilters.associatedUnits;
      this.filterOptions.craftables = this.defaultFilters.craftables;
      this.filterOptions.usage = this.defaultFilters.usage;
      this.filterOptions.name = '';
    },
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
    getGenderInfo (gender) {
      const icons = {
        male: 'fa-mars',
        female: 'fa-venus',
        other: 'fa-genderless',
      };
      const colors = {
        male: 'light-blue',
        female: 'pink lighten-1',
        other: 'grey',
      };
      return {
        icon: icons[gender],
        color: colors[gender],
      };
    },
  },
};
</script>

<style>

</style>
