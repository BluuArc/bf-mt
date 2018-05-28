<template>
  <v-container grid-list-sm class="pb-5">
    <v-layout row v-if="isLoading">
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
                <v-layout row>
                  Filters
                </v-layout>
              </div>
              <v-card>
                Filters go here
              </v-card>
            </v-expansion-panel-content>
            <v-expansion-panel-content>
              <div slot="header">
                <v-layout row>
                  Sort
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
      <v-flex xs12>
        <v-container fluid grid-list-lg>
          <v-layout row wrap>
            <v-flex
              v-for="key in unitsToShow"
              :key="key"
              xs12 sm6 md4>
              <unit-card :to="`/multidex/units/?unitId=${key}`" :unit="pageDb[key]"/>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-dialog v-model="showUnitsDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
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
import { mapState, mapActions, mapGetters } from 'vuex';
import UnitCard from '@/components/Multidex/Units/UnitCard';
import UnitDialogContent from '@/components/Multidex/Units/UnitDialogContent';
import debounce from 'lodash/debounce';

export default {
  props: ['query', 'unitId'],
  components: {
    'unit-info': UnitDialogContent,
    'unit-card': UnitCard,
  },
  computed: {
    ...mapState('units', ['pageDb', 'isLoading']),
    ...mapGetters('units', ['getImageUrls']),
    allSortedUnits () {
      return this.sortTypes[this.sortOptions.type](this.filteredKeys);
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
        'Unit ID': (keys = []) => {
          return keys.slice().sort((idA, idB) => {
            const result = (+idA - +idB);
            return this.sortOptions.isAscending ? result : -result;
          });
        },
        'Guide ID': (keys = []) => {
          return keys.slice().sort((idA, idB) => {
            const result = +this.pageDb[idA].guide_id - +this.pageDb[idB].guide_id;
            return this.sortOptions.isAscending ? result : -result;
          });
        },
        Alphabetical: (keys = []) => {
          return keys.slice().sort((idA, idB) => {
            const [nameA, nameB] = [this.pageDb[idA].name, this.pageDb[idB].name];
            const result = (nameA > nameB) ? 1 : -1;
            return this.sortOptions.isAscending ? result : -result;
          });
        },
        Rarity: (keys = []) => {
          return keys.slice().sort((idA, idB) => {
            const [rarityA, rarityB] = [+this.pageDb[idA].rarity, +this.pageDb[idB].rarity];
            const result = rarityA === rarityB ? (+idA - +idB) : (rarityA - rarityB);
            return this.sortOptions.isAscending ? result : -result;
          });
        },
        Element: (keys = []) => {
          return keys.slice().sort((idA, idB) => {
            const [elementA, elementB] = [this.pageDb[idA].element, this.pageDb[idB].element];
            const indexA = this.elements.indexOf(elementA);
            const indexB = this.elements.indexOf(elementB);
            const result = indexA === indexB ? (+idA - +idB) : (indexA - indexB);
            return this.sortOptions.isAscending ? result : -result;
          });
        },
      };
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
      },
      showUnitsDialog: false,
      filteredKeys: [],
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
    isLoading (newValue) {
      if (!newValue && this.unitId) {
        this.showUnitsDialog = true;
      }

      if (!newValue) {
        this.applyFilters();
      }
    },
    unitId (newValue) {
      this.showUnitsDialog = (!this.isLoading && !!newValue);

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
  },
  mounted () {
    if (Object.keys(this.pageDb).length > 0) {
      this.applyFilters();
    }

    if (this.unitId && !this.isLoading) {
      this.showUnitsDialog = true;
    }
  },
  methods: {
    ...mapActions('units', ['getFilteredKeys']),
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
    applyFilters: debounce(async function () {
      if (Object.keys(this.pageDb).length === 0) {
        return [];
      }
      this.filteredKeys = await this.getFilteredKeys(this.filterOptions);
    }, 250),
  },
};
</script>
