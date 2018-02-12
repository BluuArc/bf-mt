<template>
  <div id="units-container">
    <div v-show="fullUnitData === undefined">Loading unit data</div>
    <div v-show="fullUnitData !== undefined" class="ui container">
      <div class='ui buttons'>
        <button :class="{ui: true, button: true, positive: doSortByUnitID}"
          @click="doSortByUnitID = true"
          >
          Sort By Unit ID
        </button>
        <div class="or"></div>
        <button :class="{ui: true, button: true, positive: !doSortByUnitID}"
          @click="doSortByUnitID = false"
          >
          Sort By Guide ID
        </button>
      </div>
      <div class="ui cards" id="unit-list">
        <small-unit-card
          v-for="id in unitIDs"
          :key="id"
          :unitData='getUnit(id)'></small-unit-card>
      </div>
    </div>
  </div>
</template>

<script>
import SmallUnitCard from '@/components/UnitsComponents/SmallUnitCard';

export default {
  props: ['fullUnitData'],
  components: {
    'small-unit-card': SmallUnitCard,
  },
  watch: {
    fullUnitData(newData) {
      if (newData !== undefined) {
        this.unitIDs = Object.keys(newData);
        // eslint-disable-next-line
        console.log(this.unitIDs);
      }
    },
    doSortByUnitID(newValue) {
      if (newValue) {
        this.sortUnitsByUnitID();
      } else {
        this.sorUnitsByGuideID();
      }
    },
  },
  data() {
    return {
      unitIDs: [],
      doSortByUnitID: true,
    };
  },
  methods: {
    sorUnitsByGuideID() {
      this.unitIDs.sort((idA, idB) => +this.getUnit(idA).guide_id - +this.getUnit(idB).guide_id);
    },
    sortUnitsByUnitID() {
      this.unitIDs.sort((idA, idB) => +idA - +idB);
    },
    getUnit(id) {
      return this.fullUnitData[id];
    },
  },
};
</script>

<style>
#units-container #unit-list {
  margin: 0 auto;
}
</style>
