<template>
  <v-container grid-list-sm class="pb-5">
    <v-layout row v-if="isLoading">
      <v-flex xs12 class="text-xs-center pt-5">
        <v-progress-circular indeterminate/>
        <h4 class="subheading">Waiting for data to finish loading.</h4>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-else>
      <v-flex xs6 offset-xs6 class="text-xs-right mt-2 pr-3">
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
        <v-container fluid grid-list-lg>
          <v-layout row wrap>
            <v-flex
              v-for="key in itemsToShow"
              :key="key"
              xs12 sm6 md4>
              {{ pageDb[key].name }}
              <!-- <unit-card :to="`/multidex/units/?unitId=${key}`" v-if="pageDb.hasOwnProperty(key)" :unit="pageDb[key]"/> -->
            </v-flex>
          </v-layout>
          <v-layout row v-if="numEntries[activeServer] === 0">
            <v-flex xs12 class="text-xs-center">
              <p>Seems like you haven't loaded the data for this server yet. You can load the missing data at the settings page.</p>
              <v-btn to="/settings">Go To Settings Page</v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import debounce from 'lodash/debounce';

export default {
  props: ['query', 'itemId'],
  computed: {
    ...mapState('items', ['pageDb', 'isLoading', 'numEntries', 'activeServer']),
    ...mapGetters('items', ['getImageUrl']),
    allSortedItems () {
      if (this.isLoading || this.loadingFilters) {
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
      };
    },
    defaultFilters () {
      return {
        rarity: Object.keys(new Array(8).fill(0)).map(i => +i + 1),
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
    isLoading (newValue) {
      if (!newValue && this.itemId) {
        this.showItemsDialog = true;
      }

      if (!newValue) {
        this.initDb();
        this.applyFilters();
      }
    },
    itemId (newValue) {
      this.showItemsDialog = (!this.isLoading && !!newValue);

      if (this.pageDb.hasOwnProperty(newValue)) {
        document.title = `BF-MT - Item - ${this.pageDb[newValue].name}`;
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
        exclusives: [],
      },
      showItemsDialog: false,
      filteredKeys: [],
      loadingFilters: false,
    };
  },
  created () {
    if (!this.isLoading) {
      this.initDb();
    }
  },
  mounted () {
    this.resetFilters();
    if (this.itemId && !this.isLoading) {
      this.showItemsDialog = true;
    }
  },
  methods: {
    ...mapActions('items', ['getFilteredKeys', 'ensurePageDbSyncWithServer']),
    initDb: debounce(function () {
      this.ensurePageDbSyncWithServer();
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
