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
          <es-card
            v-if="pageDb.hasOwnProperty(key)"
            :to="getMultidexPathTo(key)"
            :extra-skill="pageDb[key]"
            style="min-height: 84px; height: 100%;"/>
        </v-flex>
      </v-layout>
    </template>
    <template slot="dialog-content">
      <skill-info :extraId="viewId"/>
    </template>
  </main-page-base>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import MainPageBase from '@/components/Multidex/MainPageBase';
import ExtraSkillInfo from '@/components/Multidex/ExtraSkills/DialogContent';
import SkillCard from '@/components/Multidex/ExtraSkills/SkillCard';

export default {
  props: ['query', 'viewId', 'server'],
  components: {
    'main-page-base': MainPageBase,
    'skill-info': ExtraSkillInfo,
    'es-card': SkillCard,
  },
  computed: {
    ...mapState('extraSkills', ['pageDb']),
    ...mapGetters('extraSkills', ['getMultidexPathTo']),
    requiredModules: () => ['extraSkills', 'units', 'items'],
    filterTypes: () => ['rarity', 'associatedUnits', 'exclusives'],
    sortTypes () {
      return {
        'Skill ID': (idA, idB, isAscending) => {
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
      };
    },
    routeKey () {
      return `multidex-${this.$route.name}`;
    },
  },
};
</script>
