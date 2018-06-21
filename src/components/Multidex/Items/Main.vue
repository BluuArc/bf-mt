<template>
  <main-page-base
    :required-modules="requiredModules"
    :filter-types="filterTypes"
    :sort-types="sortTypes"
    :page-db="pageDb"
    :view-id="viewId"
    :input-server="server"
    :route-key="routeKey"
    :get-multidex-path-to="getMultidexPathTo">
    <template slot="results-area" slot-scope="{ results }">
      <v-layout row wrap>
        <v-flex
          v-for="key in results"
          :key="key"
          xs12 sm6 md4>
          <item-card
            :to="getMultidexPathTo(key)"
            v-if="pageDb.hasOwnProperty(key)"
            :item="pageDb[key]"
            style="height: 100%"/>
        </v-flex>
      </v-layout>
    </template>
    <template slot="dialog-toolbar-title">
      <img
        v-if="viewId"
        :src="getImageUrl(viewId)"
        align="top"
        height="32px"/>
      <span style="margin-top: auto; margin-bottom: auto;" class="pl-2">
        <span v-if="pageDb[viewId]">
          {{ pageDb[viewId].name }}
        </span>
        <span v-else-if="viewId">
          (ID: {{ viewId }})
        </span>
      </span>
    </template>
    <template slot="dialog-content">
      <item-info :itemId="viewId"/>
    </template>
  </main-page-base>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import MainPageBase from '@/components/Multidex/MainPageBase';
import ItemCard from '@/components/Multidex/Items/ItemCard';
import ItemInfo from '@/components/Multidex/Items/ItemDialogContent';

export default {
  props: ['query', 'viewId', 'server'],
  components: {
    'main-page-base': MainPageBase,
    'item-card': ItemCard,
    'item-info': ItemInfo,
  },
  computed: {
    ...mapState('items', ['pageDb']),
    ...mapGetters('items', ['getImageUrl', 'getMultidexPathTo']),
    requiredModules: () => ['items', 'units'],
    filterTypes: () => ['rarity', 'itemTypes', 'sphereTypes', 'associatedUnits', 'craftables', 'usage', 'exclusives'],
    sortTypes () {
      return {
        'Item ID': (idA, idB, isAscending) => {
          const result = (+idA - +idB);
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
        Type: (idA, idB, isAscending) => {
          const [typeA, typeB] = [this.pageDb[idA].type, this.pageDb[idB].type];
          const getIndex = (type) => this.defaultFilters.itemTypes.indexOf(type);
          const result = typeA === typeB ? (+idA - +idB) : (getIndex(typeA) - getIndex(typeB));
          return isAscending ? result : -result;
        },
        'Sell Price': (idA, idB, isAscending) => {
          const [priceA, priceB] = [+this.pageDb[idA].sell_price, +this.pageDb[idB].sell_price];
          const result = priceA === priceB ? (+idA - +idB) : (priceA - priceB);
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
