<template>
  <main-page-base
    :required-modules="requiredModules"
    :filter-types="filterTypes"
    :sort-types="sortTypes"
    :page-db="pageDb"
    :view-id="viewId"
    :input-server="server"
    :route-key="routeKey"
    :minRarity="1"
    :is-unit="true"
    :get-multidex-path-to="getMultidexPathTo">
    <template slot="results-area" slot-scope="{ results }">
      <v-layout row wrap>
        <v-flex
          v-for="key in results"
          :key="key"
          xs12 sm6 md4>
          <unit-card :to="getMultidexPathTo(key)" v-if="pageDb.hasOwnProperty(key)" :unit="pageDb[key]"/>
        </v-flex>
      </v-layout>
    </template>
    <template slot="dialog-toolbar-title">
      <img
        v-if="viewId"
        :src="getImageUrls(viewId).ills_battle"
        align="top"
        height="32px"/>
      <span style="margin-top: auto; margin-bottom: auto;" class="pl-2">
        <span v-if="pageDb[viewId]">
          {{ pageDb[viewId].guide_id }}: {{ pageDb[viewId].name }}
        </span>
        <span v-else-if="viewId">
          (ID: {{ viewId }})
        </span>
      </span>
    </template>
    <template slot="dialog-content">
      <unit-info :unitId="viewId"/>
    </template>
  </main-page-base>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import MainPageBase from '@/components/Multidex/MainPageBase';
import UnitCard from '@/components/Multidex/Units/UnitCard';
import UnitDialogContent from '@/components/Multidex/Units/UnitDialogContent';

export default {
  props: ['query', 'viewId', 'server'],
  components: {
    'main-page-base': MainPageBase,
    'unit-info': UnitDialogContent,
    'unit-card': UnitCard,
  },
  computed: {
    ...mapState('units', ['pageDb']),
    ...mapGetters('units', ['getImageUrls', 'getMultidexPathTo']),
    requiredModules: () => ['units', 'items', 'missions'],
    filterTypes: () => ['elements', 'rarity', 'kind', 'gender', 'exclusives', 'procs', 'passives'],
    sortTypes () {
      return {
        'Unit ID': (idA, idB, isAscending) => {
          const result = (+idA - +idB);
          return isAscending ? result : -result;
        },
        'Guide ID': (idA, idB, isAscending) => {
          const result = +this.pageDb[idA].guide_id - +this.pageDb[idB].guide_id;
          return isAscending ? result : -result;
        },
        Alphabetical: (idA, idB, isAscending) => {
          const [nameA, nameB] = [this.pageDb[idA].name, this.pageDb[idB].name];
          const result = (nameA > nameB) ? 1 : -1;
          return isAscending ? result : -result;
        },
        Rarity: (idA, idB, isAscending) => {
          const [rarityA, rarityB] = [+this.pageDb[idA].rarity, +this.pageDb[idB].rarity];
          const result = rarityA === rarityB ? (+idA - +idB) : (rarityA - rarityB);
          return isAscending ? result : -result;
        },
        Element: (idA, idB, isAscending) => {
          const [elementA, elementB] = [this.pageDb[idA].element, this.pageDb[idB].element];
          const indexA = this.elements.indexOf(elementA);
          const indexB = this.elements.indexOf(elementB);
          const result = indexA === indexB ? (+idA - +idB) : (indexA - indexB);
          return isAscending ? result : -result;
        },
      };
    },
    routeKey () {
      return `multidex-${this.$route.name}`;
    },
  },
};
</script>
