<template>
  <v-container grid-list-sm class="pb-5">
    <v-layout row v-if="isLoading">
      <v-flex xs12 class="text-xs-center">
        <v-progress-circular indeterminate/>
        <h4 class="subheading">Waiting for data to finish loading.</h4>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-else>
      <v-flex class="pl-3 pr-3" xs12>
        <v-text-field v-model="filterOptions.name" label="Search"/>
      </v-flex>
      <v-flex xs6 class="pl-3">
        Showing {{ allSortedUnits.length }} Units
      </v-flex>
      <v-flex xs6 class="text-xs-right pr-3">
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
                    <v-btn block flat @click="pageIndex = 0">Go to First Page</v-btn>
                  </v-flex>
                  <v-flex xs6 class="text-xs-center">
                    <v-btn block flat @click="pageIndex = numPages - 1">Go to Last Page</v-btn>
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
          <span v-show="pageIndex < numPages">
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
      return this.filteredKeys;
    },
    numPages () {
      return Math.ceil(this.allSortedUnits.length / this.amountPerPage);
    },
    unitsToShow () {
      const startIndex = this.pageIndex * this.amountPerPage;
      return this.allSortedUnits.slice(startIndex, startIndex + this.amountPerPage);
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
  },
  mounted () {
    if (Object.keys(this.pageDb).length > 0) {
      this.applyFilters();
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
