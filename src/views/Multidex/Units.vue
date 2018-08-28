<template>
  <main-page-base
    :requiredModules="requiredModules"
    :sortTypes="sortTypes"
    :getMultidexPathTo="getMultidexPathTo"
    :inputServer="server"
    :viewId="viewId"
    :pageDb="pageDb"
  >
  </main-page-base>
</template>

<script>
import MainPageBase from '@/components/Multidex/MainPageBase';
import { mapState, mapGetters } from 'vuex';
import { elements } from '@/modules/constants';

export default {
  props: ['query', 'viewId', 'server'],
  components: {
    MainPageBase,
  },
  computed: {
    ...mapState('units', ['pageDb']),
    ...mapGetters('units', ['getImageUrls', 'getMultidexPathTo']),
    requiredModules: () => ['units', 'items', 'missions'],
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
          const indexA = elements.indexOf(elementA);
          const indexB = elements.indexOf(elementB);
          const result = indexA === indexB ? (+idA - +idB) : (indexA - indexB);
          return isAscending ? result : -result;
        },
      };
    },
  },
};
</script>
