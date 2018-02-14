<template>
  <div id="units-container">
    <div v-show="fullUnitData === undefined">Loading unit data</div>
    <div v-show="fullUnitData !== undefined" class="ui container">
      <large-unit-card :unitData="selectedUnit"></large-unit-card>
      <button class='ui button' id='sort-filter-button' data-position="bottom center">
        Sort and Filter Options
      </button>
      <div class='ui popup hidden' id='sort-filter-popup'>
        <div class="ui stackable grid container">
          <div class="row">
            <div class="sixteen wide column">
              Sorting Options:
            </div>
          </div>
          <div class="row">
            <div class="four wide column"
              v-for="(value, key) in sortingOptions"
              :key="key">
              <div :class="getSortButtonClass(key)"
                @click="currentSortOption = key">
                {{ key }}
              </div>
            </div>
          </div>
        </div>
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

/* global $ */
export default {
  props: ['fullUnitData'],
  components: {
    'small-unit-card': SmallUnitCard,
    'large-unit-card': LargeUnitCard,
  },
  mounted() {
    $(this.$el).find('#sort-filter-button').popup({
      popup: $(this.$el).find('#sort-filter-popup'),
      on: 'click',
    });
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
    currentSortOption(newKey) {
      this.sortUnitsBy(newKey);
    },
  },
  data() {
    return {
      unitIDs: [],
      elements: ['fire', 'water', 'earth', 'thunder', 'light', 'dark'],
      currentSortOption: 'Unit ID',
      selectedUnit: {},
      sortingOptions: {
        'Unit ID': () => { this.unitIDs.sort((idA, idB) => +idA - +idB); },
        'Guide ID': () => { this.unitIDs.sort((idA, idB) => +this.getUnit(idA).guide_id - +this.getUnit(idB).guide_id); },
        Alphabetical: () => {
          this.unitIDs.sort((idA, idB) => {
            const [nameA, nameB] = [this.getUnit(idA).name, this.getUnit(idB).name];
            return (nameA > nameB) ? 1 : -1;
          });
        },
        Rarity: () => {
          this.unitIDs.sort((idA, idB) => {
            const [rarityA, rarityB] = [+this.getUnit(idA).rarity, +this.getUnit(idB).rarity];
            return rarityA === rarityB ? (+idA - +idB) : (rarityA - rarityB);
          });
        },
        Element: () => {
          this.unitIDs.sort((idA, idB) => {
            const [elementA, elementB] = [this.getUnit(idA).element, this.getUnit(idB).element];
            const indexA = this.elements.indexOf(elementA);
            const indexB = this.elements.indexOf(elementB);
            return indexA === indexB ? (+idA - +idB) : (indexA - indexB);
          });
        },
      },
    };
  },
  methods: {
    sortUnitsBy(type) {
      if (this.sortingOptions[type]) {
        this.sortingOptions[type]();
      }
    },
    getSortButtonClass(key) {
      return { 'ui fluid padded button': true, positive: key === this.currentSortOption };
    },
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

#units-container #sort-filter-popup {
  min-width: 45%;
}

#units-container #sort-filter-popup .four.wide.column {
  padding-bottom: 1rem;
}
</style>
