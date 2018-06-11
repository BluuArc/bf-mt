<template>
  <v-container grid-list-sm class="pb-5">
    <v-layout row v-if="isDataLoading || !finishedInit">
      <v-flex xs12 class="text-xs-center pt-5">
        <v-progress-circular indeterminate/>
        <h4 class="subheading">Waiting for data to finish loading.</h4>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-else>
      <v-flex xs12>
        <v-card raised class="mr-3 ml-3">
          <v-card-text>
            <v-container fluid class="pa-0">
              <v-layout row>
                <v-flex xs8>
                  <v-text-field v-model="filterOptions.name" label="Search"/>
                </v-flex>
                <v-flex xs4 class="center-align-parent text-xs-center">
                  <span class="center-align-container">Showing {{ allSortedUnits.length }} Units</span>
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
                  <v-chip small v-show="filterOptions.exclusives.length < defaultFilters.exclusives.length" style="text-transform: capitalize">
                    {{ filterOptions.exclusives[0] }}s Only
                  </v-chip>
                </v-layout>
              </div>
              <v-card class="filter-area">
                <v-card-text>
                  <v-layout row wrap class="pl-3 pr-3">
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
                  <v-layout row wrap class="pl-3 pr-3">
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
                  <v-layout row wrap class="pl-3 pr-3">
                    <v-flex xs12>
                      <h3 :class="{ subheading: true, 'd-inline': $vuetify.breakpoint.smAndUp }">Server Exclusives</h3>
                      <v-layout row>
                        <v-radio-group v-model="filterOptions.exclusives" :row="$vuetify.breakpoint.mdAndUp">
                          <v-radio
                            :value="exclusiveFilterOptions.all"
                            label="All"/>
                          <v-radio
                            :value="exclusiveFilterOptions.exclusive"
                            label="Exclusives Only"/>
                          <v-radio
                            :value="exclusiveFilterOptions.nonExclusive"
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
                    Units Per Page:
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
        <h4 class="subheading">Searching for units with specified filters.</h4>
      </v-flex>
      <v-flex xs12 v-else>
        <result-viewer
          class="grid-list-lg"
          :max-results="numEntries[activeServer]"
          :num-results="allSortedUnits.length"
          :required-modules="['units', 'items']"
          :server-type="activeServer">
          <v-layout row wrap>
            <v-flex
              v-for="key in unitsToShow"
              :key="key"
              xs12 sm6 md4>
              <unit-card :to="getMultidexPathTo(key)" v-if="pageDb.hasOwnProperty(key)" :unit="pageDb[key]"/>
            </v-flex>
          </v-layout>
        </result-viewer>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-dialog v-model="showDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card>
          <v-toolbar fixed>
            <v-btn icon to="/multidex/units">
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>
              <img
                v-if="unitId"
                :src="getImageUrls(unitId).ills_battle"
                align="top"
                height="32px"/>
              <span style="margin-top: auto; margin-bottom: auto;" class="pl-2">
                <span v-if="pageDb[unitId]">
                  {{ pageDb[unitId].guide_id }}: {{ pageDb[unitId].name }}
                </span>
                <span v-else-if="unitId">
                  (ID: {{ unitId }})
                </span>
              </span>
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text v-if="unitId" class="pl-0 pr-0 pt-5">
            <unit-info :unitId="unitId"/>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
import UnitCard from '@/components/Multidex/Units/UnitCard';
import UnitDialogContent from '@/components/Multidex/Units/UnitDialogContent';
import ElementIcon from '@/components/Multidex/Units/ElementIcon';
import ResultViewer from '@/components/Multidex/ResultViewer';
import debounce from 'lodash/debounce';

export default {
  props: ['query', 'viewId'],
  components: {
    'unit-info': UnitDialogContent,
    'unit-card': UnitCard,
    'element-icon': ElementIcon,
    'result-viewer': ResultViewer,
  },
  computed: {
    ...mapState('units', ['pageDb', 'isLoading', 'numEntries', 'activeServer']),
    ...mapState('items', { itemEntries: 'numEntries' }),
    ...mapGetters('units', ['getImageUrls', 'getMultidexPathTo']),
    ...mapState(['inInitState']),
    isDataLoading () {
      return this.inInitState || this.isLoading;
    },
    unitId () {
      return this.viewId;
    },
    allSortedUnits () {
      if (this.isDataLoading || this.loadingFilters) {
        return [];
      }
      // console.warn('starting sort', this.filteredKeys);
      try {
        // const result = this.sortTypes[this.sortOptions.type](this.filteredKeys);
        const result = this.filteredKeys.slice().sort(this.sortTypes[this.sortOptions.type]);
        // console.warn('finish sort');
        return result;
      } catch (err) {
        console.error('error sorting', err);
        return this.filteredKeys;
      }
    },
    numPages () {
      return Math.ceil(this.allSortedUnits.length / this.amountPerPage);
    },
    unitsToShow () {
      const startIndex = this.pageIndex * this.amountPerPage;
      return this.allSortedUnits.slice(startIndex, startIndex + this.amountPerPage);
    },
    elements: () => ['fire', 'water', 'earth', 'thunder', 'light', 'dark'],
    sortTypes () {
      return {
        'Unit ID': (idA, idB) => {
          const result = (+idA - +idB);
          return this.sortOptions.isAscending ? result : -result;
        },
        'Guide ID': (idA, idB) => {
          const result = +this.pageDb[idA].guide_id - +this.pageDb[idB].guide_id;
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
        Element: (idA, idB) => {
          const [elementA, elementB] = [this.pageDb[idA].element, this.pageDb[idB].element];
          const indexA = this.elements.indexOf(elementA);
          const indexB = this.elements.indexOf(elementB);
          const result = indexA === indexB ? (+idA - +idB) : (indexA - indexB);
          return this.sortOptions.isAscending ? result : -result;
        },
      };
    },
    defaultFilters () {
      return {
        element: this.elements.slice(),
        rarity: Object.keys(new Array(8).fill(0)).map(i => +i + 1),
        gender: ['male', 'female', 'other'],
        kind: ['normal', 'evolution', 'enhancing', 'sale'],
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
    hasFilters () {
      return !!this.filterOptions.name ||
        Object.keys(this.defaultFilters)
        .map(key => this.filterOptions[key].length !== this.defaultFilters[key].length)
        .reduce((acc, val) => acc || val, false);
    },
    hasRequiredModules () {
      return this.numEntries[this.activeServer] > 0 && this.itemEntries[this.activeServer] > 0;
    },
  },
  data () {
    return {
      pageIndex: 0,
      amountPerPage: 27,
      sortOptions: {
        type: 'Element',
        isAscending: true,
      },
      filterOptions: {
        name: '',
        element: [],
        rarity: [],
        gender: [],
        kind: [],
        exclusives: [],
      },
      showDialog: false,
      filteredKeys: [],
      loadingFilters: false,
      finishedInit: false,
    };
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
      } else if (value > this.allSortedUnits.length) {
        this.amountPerPage = this.allSortedUnits.length;
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
    unitId (newValue) {
      this.setShowDialog();

      if (this.pageDb.hasOwnProperty(newValue)) {
        document.title = `BF-MT - Units - ${this.pageDb[newValue].name}`;
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
      },
    },
    showDialog (newValue) {
      this.setHtmlOverflow(newValue);
    },
    finishedInit () {
      this.setShowDialog();
    },
    hasRequiredModules (newValue) {
      if (newValue) {
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
  mounted () {
    this.resetFilters();
    this.setShowDialog();
  },
  methods: {
    ...mapMutations(['setHtmlOverflow']),
    ...mapActions('units', ['getFilteredKeys', 'ensurePageDbSyncWithServer']),
    ...mapActions('items', { itemsDbSync: 'ensurePageDbSyncWithServer' }),
    setShowDialog () {
      this.showDialog = !this.isDataLoading && !!this.viewId && this.finishedInit && this.hasRequiredModules;
    },
    initDb: debounce(async function () {
      await this.itemsDbSync();
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
      this.loadingFilters = false;
    }, 250),
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
    resetFilters () {
      Object.keys(this.defaultFilters).forEach(key => {
        this.filterOptions[key] = this.defaultFilters[key].slice();
      });
      this.filterOptions.exclusives = this.defaultFilters.exclusives;
      this.filterOptions.name = '';
    },
  },
};
</script>
