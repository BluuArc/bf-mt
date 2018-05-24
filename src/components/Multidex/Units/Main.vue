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
        <v-text-field v-model="searchText" label="Search"/>
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
              <v-card>
                <v-container fluid class="pa-1" grid-list-md>
                  <v-layout row>
                    <v-flex xs4>
                      <div class="card__media text-xs-center">
                        <!-- <img :src="getImageUrls(key).ills_thum" class="mx-auto" style="height: 64px; width: 64px;"/> -->
                        <unit-thumbnail
                          :src="getImageUrls(key).ills_thum"
                          class="mx-auto"
                          style="height: 64px; width: 64px;"
                          imgStyle="height: 64px; width: 64px;"
                          :rarity="pageDb[key].rarity"
                          :title="pageDb[key].name"/>
                      </div>
                      <!-- <v-card-media :src="getImageUrls(key).ills_thum" height="64px" contain/> -->
                    </v-flex>
                    <v-flex xs8>
                      {{ pageDb[key].name }}
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import LazyLoadThumbnail from '@/components/Multidex/Units/LazyLoadThumbnail';

export default {
  components: {
    'unit-thumbnail': LazyLoadThumbnail,
  },
  computed: {
    ...mapState('units', ['pageDb', 'isLoading']),
    ...mapGetters('units', ['getImageUrls']),
    allSortedUnits () {
      return Object.keys(this.pageDb);
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
      searchText: '',
      pageIndex: 0,
      amountPerPage: 27,
      sortOptions: {
        type: 'Element',
        isAscending: true,
      },
    };
  },
  watch: {
    allSortedUnits () {
      this.pageIndex = 0;
    },
    searchText () {
      this.pageIndex = 0;
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
  },
  methods: {
    decrementPage () {
      console.debug(this.$vuetify.breakpoint);
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
  },
};
</script>
