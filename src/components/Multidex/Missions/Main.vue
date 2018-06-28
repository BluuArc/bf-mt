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
    <template slot="dialog-content">
      <mission-info :missionId="viewId"/>
    </template>
  </main-page-base>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import MainPageBase from '@/components/Multidex/MainPageBase';
import MissionInfo from '@/components/Multidex/Missions/DialogContent';
import MissionCard from '@/components/Multidex/Missions/MissionCard';

export default {
  props: ['query', 'viewId', 'server'],
  components: {
    'main-page-base': MainPageBase,
    'mission-info': MissionInfo,
    'mission-card': MissionCard,
  },
  computed: {
    ...mapState('missions', ['pageDb']),
    ...mapGetters('missions', ['getMultidexPathTo']),
    requiredModules: () => ['missions', 'units', 'items'],
    filterTypes: () => ['associatedUnits', 'associatedItems', 'gems', 'exclusives', 'continues', 'land', 'area', 'dungeon'],
    sortTypes () {
      return {
        'Mission ID': (idA, idB, isAscending) => {
          const result = this.getIdCompareResult({ idA, idB });
          return isAscending ? result : -result;
        },
        Alphabetical: (idA, idB, isAscending) => {
          const [strA, strB] = [this.pageDb[idA].name, this.pageDb[idB].name];
          const result = this.getStringCompareResult({ strA, strB }, { idA, idB });
          return isAscending ? result : -result;
        },
        Energy: (idA, idB, isAscending) => {
          const [numA, numB] = [+this.pageDb[idA].energy_use, +this.pageDb[idB].energy_use];
          const result = this.getNumberCompareResult({ numA, numB }, { idA, idB });
          return isAscending ? result : -result;
        },
        'Battle Count': (idA, idB, isAscending) => {
          const [numA, numB] = [+this.pageDb[idA].battle_count, +this.pageDb[idB].battle_count];
          const result = this.getNumberCompareResult({ numA, numB }, { idA, idB });
          return isAscending ? result : -result;
        },
        Map: (idA, idB, isAscending) => {
          const getStringResult = (a, b) => (a > b) ? 1 : -1;
          const [missionA, missionB] = [this.pageDb[idA], this.pageDb[idB]];
          const { land: landA, area: areaA, dungeon: dungeonA } = missionA;
          const { land: landB, area: areaB, dungeon: dungeonB } = missionB;
          let result;
          // missions are categorized as land/area/dungeon/name
          if (landA === landB) {
            if (areaA === areaB) {
              if (dungeonA === dungeonB) {
                result = (+idA - +idB);
              } else {
                result = getStringResult(dungeonA, dungeonB);
              }
            } else {
              result = getStringResult(areaA, areaB);
            }
          } else {
            result = getStringResult(landA, landB);
          }
          return isAscending ? result : -result;
        },
        XP: (idA, idB, isAscending) => {
          const [numA, numB] = [+this.pageDb[idA].xp, this.pageDb[idB].xp];
          const result = this.getNumberCompareResult({ numA, numB }, { idA, idB });
          return isAscending ? result : -result;
        },
        'XP/EN': (idA, idB, isAscending) => {
          const [xpA, xpB] = [+this.pageDb[idA].xp, this.pageDb[idB].xp];
          const [energyA, energyB] = [+this.pageDb[idA].energy_use, +this.pageDb[idB].energy_use];
          const [numA, numB] = [this.calculateXpPerEnergy(xpA, energyA), this.calculateXpPerEnergy(xpB, energyB)];
          const result = this.getNumberCompareResult({ numA, numB }, { idA, idB });
          return isAscending ? result : -result;
        },
      };
    },
    routeKey () {
      return `multidex-${this.$route.name}`;
    },
  },
  methods: {
    getIdCompareResult ({ idA, idB }) {
      return +idA - +idB;
    },
    getStringCompareResult ({ strA, strB }, ids) {
      if (strA === strB) {
        return this.getIdCompareResult(ids);
      }
      return (strA > strB) ? 1 : -1;
    },
    getNumberCompareResult ({ numA, numB }, ids) {
      if (numA === numB) {
        return this.getIdCompareResult(ids);
      }
      return numA - numB;
    },
    calculateXpPerEnergy (xp = 0, en = 0) {
      return xp / (Math.max(1, en));
    },
  },
};
</script>
