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
                  <span class="center-align-container">Showing {{ allSortedItems.length }} Items</span>
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
                  <v-chip small v-show="filterOptions.itemTypes.length < defaultFilters.itemTypes.length" style="text-transform: capitalize">
                    <span v-if="filterOptions.itemTypes.length === 0">
                      No Types
                    </span>
                    <span v-else-if="filterOptions.itemTypes.length === 1">
                      {{ filterOptions.itemTypes[0] }}s Only
                    </span>
                    <span v-else>
                      {{ filterOptions.itemTypes.length }} Item Types
                    </span>
                  </v-chip>
                  <v-chip small v-show="filterOptions.sphereTypes.length < defaultFilters.sphereTypes.length" style="text-transform: capitalize">
                    <span v-if="filterOptions.sphereTypes.length === 0">
                      No Types
                    </span>
                    <span v-else-if="filterOptions.sphereTypes.length <= 5">
                      <sphere-type-icon v-for="sphereType in filterOptions.sphereTypes" :category="sphereType" :key="sphereType" class="ml-0 mr-1" style="margin-bottom: 2px"/>
                      <span v-if="filterOptions.sphereTypes.length === 1">
                        Only
                      </span>
                    </span>
                    <span v-else>
                      {{ filterOptions.sphereTypes.length }} Sphere Types
                    </span>
                  </v-chip>
                  <v-chip small v-show="filterOptions.craftables.length < defaultFilters.craftables.length" style="text-transform: capitalize">
                    {{ filterOptions.craftables[0] }}s Only
                  </v-chip>
                  <v-chip small v-show="filterOptions.usage.length < defaultFilters.usage.length" style="text-transform: capitalize">
                    {{ filterOptions.usage[0] }} Items Only
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
                  <v-layout row wrap class="pl-3 pr-3">
                    <v-flex xs12>
                      <h3 :class="{ subheading: true, 'd-inline': $vuetify.breakpoint.smAndUp }">Item Type</h3>
                      <v-btn outline class="mr-0" @click="filterOptions.itemTypes = defaultFilters.itemTypes.slice()">All</v-btn>
                      <v-btn outline class="ml-0" @click="filterOptions.itemTypes = []">None</v-btn>
                      <v-layout row wrap>
                        <v-flex xs6 sm3 v-for="(type, i) in defaultFilters.itemTypes" :key="i">
                          <v-checkbox :value="type" v-model="filterOptions.itemTypes">
                            <div slot="label">
                              <span style="text-transform: capitalize">{{ itemTypeMapping[type] }}</span>
                            </div>
                          </v-checkbox>
                        </v-flex>
                      </v-layout>
                    </v-flex>
                  </v-layout>
                  <v-layout row wrap class="pl-3 pr-3">
                    <v-flex xs12>
                      <h3 :class="{ subheading: true, 'd-inline': $vuetify.breakpoint.smAndUp }">Sphere Type</h3>
                      <v-btn outline class="mr-0" @click="filterOptions.sphereTypes = defaultFilters.sphereTypes.slice()">All</v-btn>
                      <v-btn outline class="ml-0" @click="filterOptions.sphereTypes = []">None</v-btn>
                      <v-layout row wrap>
                        <v-flex xs6 sm3 v-for="(type, i) in defaultFilters.sphereTypes" :key="i">
                          <v-checkbox :value="type" v-model="filterOptions.sphereTypes">
                            <div slot="label">
                              <sphere-type-icon :category="type" class="ml-0 mr-1"/>
                              <span style="text-transform: capitalize">{{ getSphereCategory(type) }}</span>
                            </div>
                          </v-checkbox>
                        </v-flex>
                      </v-layout>
                    </v-flex>
                  </v-layout>
                  <v-layout row wrap class="pl-3 pr-3">
                    <v-flex xs12>
                      <h3 :class="{ subheading: true, 'd-inline': $vuetify.breakpoint.smAndUp }">Craftables</h3>
                      <v-layout row>
                        <v-radio-group v-model="filterOptions.craftables" :row="$vuetify.breakpoint.mdAndUp">
                          <v-radio
                            :value="craftableFilterOptions.all"
                            label="All"/>
                          <v-radio
                            :value="craftableFilterOptions.craftable"
                            label="Craftables Only"/>
                          <v-radio
                            :value="craftableFilterOptions.nonCraftable"
                            label="Non-Craftables Only"/>
                        </v-radio-group>
                      </v-layout>
                    </v-flex>
                  </v-layout>
                  <v-layout row wrap class="pl-3 pr-3">
                    <v-flex xs12>
                      <h3 :class="{ subheading: true, 'd-inline': $vuetify.breakpoint.smAndUp }">Usage</h3>
                      <v-layout row>
                        <v-radio-group v-model="filterOptions.usage" :row="$vuetify.breakpoint.mdAndUp">
                          <v-radio
                            :value="usageFilterOptions.all"
                            label="All"/>
                          <v-radio
                            :value="usageFilterOptions.used"
                            label="Used in Other Items Only"/>
                          <v-radio
                            :value="usageFilterOptions.unused"
                            label="Not Used in Other Items Only"/>
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
                    Items Per Page:
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
        <h4 class="subheading">Searching for items with specified filters.</h4>
      </v-flex>
      <v-flex xs12 v-else>
        <result-viewer
          class="grid-list-lg"
          :max-results="numEntries[activeServer]"
          :num-results="allSortedItems.length"
          :required-modules="['units', 'items']"
          :server-type="activeServer">
          <v-layout row wrap>
            <v-flex
              v-for="key in itemsToShow"
              :key="key"
              xs12 sm6 md4>
              <item-card
                :to="getMultidexPathTo(key)"
                v-if="pageDb.hasOwnProperty(key)"
                :item="pageDb[key]"
                style="height: 100%"/>
            </v-flex>
          </v-layout>
        </result-viewer>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-dialog v-model="showDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card>
          <v-toolbar fixed>
            <v-btn icon to="/multidex/items">
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>
              <img
                v-if="itemId"
                :src="getImageUrl(itemId)"
                align="top"
                height="32px"/>
              <span style="margin-top: auto; margin-bottom: auto;" class="pl-2">
                <span v-if="pageDb[itemId]">
                  {{ pageDb[itemId].name }}
                </span>
                <span v-else-if="itemId">
                  (ID: {{ itemId }})
                </span>
              </span>
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text v-if="itemId" class="pl-0 pr-0 pt-5">
            <item-info :itemId="itemId"/>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
import debounce from 'lodash/debounce';
import ItemCard from '@/components/Multidex/Items/ItemCard';
import ItemInfo from '@/components/Multidex/Items/ItemDialogContent';
import SphereTypeIcon from '@/components/Multidex/Items/SphereTypeIcon';
import ResultViewer from '@/components/Multidex/ResultViewer';
import LoadingComponent from '@/components/Multidex/LoadingComponent';

export default {
  props: ['query', 'viewId'],
  components: {
    'item-card': ItemCard,
    'item-info': ItemInfo,
    'sphere-type-icon': SphereTypeIcon,
    'result-viewer': ResultViewer,
    'loading-component': LoadingComponent,
  },
  computed: {
    ...mapState('items', ['pageDb', 'isLoading', 'numEntries', 'activeServer', 'loadingMessage']),
    ...mapState('units', { unitEntries: 'numEntries', unitLoadingMessage: 'loadingMessage' }),
    ...mapGetters('items', ['getImageUrl', 'getSphereCategory', 'getMultidexPathTo']),
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
    itemId () {
      return this.viewId;
    },
    allSortedItems () {
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
      return Math.ceil(this.allSortedItems.length / this.amountPerPage);
    },
    itemsToShow () {
      const startIndex = this.pageIndex * this.amountPerPage;
      return this.allSortedItems.slice(startIndex, startIndex + this.amountPerPage);
    },
    sortTypes () {
      return {
        'Item ID': (idA, idB) => {
          const result = (+idA - +idB);
          return this.sortOptions.isAscending ? result : -result;
        },
        Alphabetical: (idA, idB) => {
          const [nameA, nameB] = [this.pageDb[idA].name, this.pageDb[idB].name];
          const result = (nameA > nameB) ? 1 : -1;
          return this.sortOptions.isAscending ? result : -result;
        },
        Rarity: (idA, idB) => {
          const [rarityA, rarityB] = [+this.pageDb[idA].rarity, +this.pageDb[idB].rarity];
          const result = rarityA === rarityB ? (+idA - +idB) : (rarityA - rarityB);
          return this.sortOptions.isAscending ? result : -result;
        },
        Type: (idA, idB) => {
          const [typeA, typeB] = [this.pageDb[idA].type, this.pageDb[idB].type];
          const getIndex = (type) => this.defaultFilters.itemTypes.indexOf(type);
          const result = typeA === typeB ? (+idA - +idB) : (getIndex(typeA) - getIndex(typeB));
          return this.sortOptions.isAscending ? result : -result;
        },
        'Sell Price': (idA, idB) => {
          const [priceA, priceB] = [+this.pageDb[idA].sell_price, +this.pageDb[idB].sell_price];
          const result = priceA === priceB ? (+idA - +idB) : (priceA - priceB);
          return this.sortOptions.isAscending ? result : -result;
        },
      };
    },
    defaultFilters () {
      return {
        rarity: Object.keys(new Array(8).fill(0)).map(i => +i),
        sphereTypes: Object.keys(new Array(15).fill(0)).map(i => +i),
        itemTypes: ['consumable', 'material', 'raid', 'sphere', 'evomat', 'summoner_consumable', 'ls_sphere'],
        exclusives: this.exclusiveFilterOptions.all,
        craftables: this.craftableFilterOptions.all,
        usage: this.usageFilterOptions.all,
      };
    },
    itemTypeMapping () {
      return {
        consumable: 'Item',
        material: 'Material',
        sphere: 'Sphere',
        evomat: 'Evolution Material',
        summoner_consumable: 'Booster',
        raid: 'Raid Item',
        ls_sphere: 'LS Sphere',
      };
    },
    exclusiveFilterOptions () {
      return {
        all: ['exclusive', 'non-exclusive'],
        exclusive: ['exclusive'],
        nonExclusive: ['non-exclusive'],
      };
    },
    craftableFilterOptions () {
      return {
        all: ['craftable', 'non-craftable'],
        craftable: ['craftable'],
        nonCraftable: ['non-craftable'],
      };
    },
    usageFilterOptions () {
      return {
        all: ['used', 'unused'],
        used: ['used'],
        unused: ['unused'],
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
      } else if (value > this.allSortedItems.length) {
        this.amountPerPage = this.allSortedItems.length;
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
    itemId (newValue) {
      this.setShowDialog();

      if (this.pageDb.hasOwnProperty(newValue)) {
        document.title = `BF-MT - Items - ${this.pageDb[newValue].name}`;
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
      amountPerPage: 27,
      sortOptions: {
        type: 'Item ID',
        isAscending: true,
      },
      filterOptions: {
        name: '',
        rarity: [],
        sphereTypes: [],
        itemTypes: [],
        exclusives: [],
        craftables: [],
        usage: [],
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
    ...mapActions('items', ['getFilteredKeys', 'ensurePageDbSyncWithServer']),
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

        if (this.filterOptions.craftables.length === 2) {
          this.filterOptions.craftables = this.craftableFilterOptions.all;
        } else {
          const elem = this.filterOptions.craftables[0];
          this.filterOptions.craftables = this.craftableFilterOptions[(elem === this.craftableFilterOptions.craftable[0]) ? 'craftable' : 'nonCraftable'];
        }

        if (this.filterOptions.usage.length === 2) {
          this.filterOptions.usage = this.usageFilterOptions.all;
        } else {
          const elem = this.filterOptions.usage[0];
          this.filterOptions.usage = this.usageFilterOptions[(elem === this.usageFilterOptions.used[0]) ? 'used' : 'unused'];
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
          filterCopy[key] = filters[key].slice();
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
      this.filterOptions.craftables = this.defaultFilters.craftables;
      this.filterOptions.usage = this.defaultFilters.usage;
      this.filterOptions.name = '';
    },
  },
};
</script>
