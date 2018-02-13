<template>
  <div id="units-container">
    <div v-show="fullUnitData === undefined">Loading unit data</div>
    <div v-show="fullUnitData !== undefined" class="ui container">
      <large-unit-card :unitData="selectedUnit"></large-unit-card>
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
          :unitData='getUnit(id)'
          v-on:unit-select="setSelectedUnit"></small-unit-card>
      </div>
    </div>
  </div>
</template>

<script>
import SmallUnitCard from '@/components/UnitsComponents/SmallUnitCard';
import LargeUnitCard from '@/components/UnitsComponents/LargeUnitCard';

export default {
  props: ['fullUnitData'],
  components: {
    'small-unit-card': SmallUnitCard,
    'large-unit-card': LargeUnitCard,
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
      selectedUnit: {},
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
    setSelectedUnit(id) {
      if (this.selectedUnit && this.selectedUnit.id === id) {
        this.selectedUnit = {};
      }

      setTimeout(() => { this.selectedUnit = this.getUnit(id); }, 100);
    },
  },
};
</script>

<style>
#units-container #unit-list {
  margin: 0 auto;
}
</style>
