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
          <mission-card
            v-if="pageDb.hasOwnProperty(key)"
            :to="getMultidexPathTo(key)"
            :mission="pageDb[key]"
            style="min-height: 84px; height: 100%;"/>
        </v-flex>
      </v-layout>
    </template>
    <!-- <template slot="dialog-content">
      <skill-info :leaderId="viewId"/>
    </template> -->
  </main-page-base>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import MainPageBase from '@/components/Multidex/MainPageBase';
// import SkillInfo from '@/components/Multidex/LeaderSkills/DialogContent';
import MissionCard from '@/components/Multidex/Missions/MissionCard';

export default {
  props: ['query', 'viewId', 'server'],
  components: {
    'main-page-base': MainPageBase,
    // 'skill-info': SkillInfo,
    'mission-card': MissionCard,
  },
  computed: {
    ...mapState('missions', ['pageDb']),
    ...mapGetters('missions', ['getMultidexPathTo']),
    requiredModules: () => ['missions', 'units', 'items'],
    filterTypes: () => ['associatedUnits', 'exclusives'],
    sortTypes () {
      return {
        'Mission ID': (idA, idB, isAscending) => {
          const result = (+idA - +idB);
          return isAscending ? result : -result;
        },
        Alphabetical: (idA, idB, isAscending) => {
          const [nameA, nameB] = [this.pageDb[idA].name, this.pageDb[idB].name];
          const result = (nameA > nameB) ? 1 : -1;
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
