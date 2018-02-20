<template>
  <div id="units-container">
    <div v-show="fullUnitData === undefined">Loading unit data</div>
    <div v-if="fullUnitData !== undefined && fullUnitData.error === undefined"
      class="ui container">
      <large-unit-card :unitData="selectedUnit"></large-unit-card>
      <div id="options-section">
        <div class='ui attached menu' id="options">
          <button class='ui left floated button item'
            id='sort-button' data-position="bottom left">
            Sort Options
          </button>
          <button class='ui right floated button item'
            @click="showFilterPanel = !showFilterPanel"
            id='filter-button'>
            Filter Options
          </button>
        </div>
        <div class='ui popup hidden' id='sort-popup'>
          <div class="ui stackable grid container">
            <div class="row">
              <div class="sixteen wide column">
                <div class="ui buttons">
                  <button @click="doSortDescending = false"
                    :class="ascendingClass">
                    Ascending
                  </button>
                  <div class="or"></div>
                  <button @click="doSortDescending = true"
                    :class="descendingClass">
                    Descending
                  </button>
                </div>
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
        <div :class="{ 'ui attached segment': true, hidden: !showFilterPanel }"
          id="filter-panel">
          <div class='header'><b>Showing {{ unitIDs.length }} units</b></div>
          <div class='ui segments' v-if="filterOptions !== null">
            <div class='ui segment' id="elements">
              <div class='header'><b>Element</b></div>
              <div class='ui six compact buttons'>
                <button v-for="value in getDefaultFilters().elements" :key="value"
                  @click="toggleElement(value)"
                  :class="{ 'ui button': true, green: filterOptions.elements.indexOf(value) > -1 }">
                    {{ value }}
                  </button>
              </div>
            </div>
            <div class='ui segment' id="rarity">
              <div class='header'><b>Rarity</b></div>
              <div class='ui eight compact buttons'>
                <button v-for="value in getDefaultFilters().rarity" :key="value"
                  @click="toggleRarity(value)"
                  :class="{ 'ui button': true, green: filterOptions.rarity.indexOf(value) > -1 }">
                  <span v-if="value !== 8">{{ value }}*</span>
                  <span v-else>OE</span>
                </button>
              </div>
            </div>
            <div class='ui segment' id="gender">
              <div class='header'><b>Gender</b></div>
              <div class='ui six compact buttons'>
                <button v-for="value in getDefaultFilters().gender" :key="value"
                  @click="toggleGender(value)"
                  :class="{ 'ui button': true, green: filterOptions.gender.indexOf(value) > -1 }">
                    {{ value }}
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="ui three stackable cards" id="unit-list">
        <small-unit-card
          v-for="id in unitIDs"
          :key="id"
          :unitData='getUnit(id)'
          v-on:unit-select="setSelectedUnit"></small-unit-card>
      </div>
    </div>
    <div v-else-if="fullUnitData !== undefined">
      Error loading unit data.
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
    $(this.$el).find('#sort-button').popup({
      popup: $(this.$el).find('#sort-popup'),
      on: 'click',
    });

    this.filterOptions = this.getDefaultFilters();

    if (this.fullUnitData !== undefined) {
      this.unitIDs = Object.keys(this.fullUnitData).filter(id => id !== '1');
      this.sortUnitsBy(this.currentSortOption);
    }
  },
  watch: {
    fullUnitData(newData) {
      if (newData !== undefined) {
        this.unitIDs = Object.keys(newData).filter(id => id !== '1');
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
    doSortDescending() {
      this.sortUnitsBy(this.currentSortOption);
    },
  },
  computed: {
    ascendingClass() {
      return { 'ui button': true, positive: !this.doSortDescending };
    },
    descendingClass() {
      return { 'ui button': true, positive: this.doSortDescending };
    },
  },
  data() {
    return {
      unitIDs: [],
      elements: ['fire', 'water', 'earth', 'thunder', 'light', 'dark'],
      currentSortOption: 'Unit ID',
      selectedUnit: {},
      doSortDescending: false,
      showFilterPanel: false,
      sortingOptions: {
        'Unit ID': () => {
          this.unitIDs.sort((idA, idB) => {
            const result = (+idA - +idB);
            return !this.doSortDescending ? result : -result;
          });
        },
        'Guide ID': () => {
          this.unitIDs.sort((idA, idB) => {
            const result = +this.getUnit(idA).guide_id - +this.getUnit(idB).guide_id;
            return !this.doSortDescending ? result : -result;
          });
        },
        Alphabetical: () => {
          this.unitIDs.sort((idA, idB) => {
            const [nameA, nameB] = [this.getUnit(idA).name, this.getUnit(idB).name];
            const result = (nameA > nameB) ? 1 : -1;
            return !this.doSortDescending ? result : -result;
          });
        },
        Rarity: () => {
          this.unitIDs.sort((idA, idB) => {
            const [rarityA, rarityB] = [+this.getUnit(idA).rarity, +this.getUnit(idB).rarity];
            const result = rarityA === rarityB ? (+idA - +idB) : (rarityA - rarityB);
            return !this.doSortDescending ? result : -result;
          });
        },
        Element: () => {
          this.unitIDs.sort((idA, idB) => {
            const [elementA, elementB] = [this.getUnit(idA).element, this.getUnit(idB).element];
            const indexA = this.elements.indexOf(elementA);
            const indexB = this.elements.indexOf(elementB);
            const result = indexA === indexB ? (+idA - +idB) : (indexA - indexB);
            return !this.doSortDescending ? result : -result;
          });
        },
      },
      filterOptions: null,
    };
  },
  methods: {
    getDefaultFilters() {
      return {
        elements: ['fire', 'water', 'earth', 'thunder', 'light', 'dark'],
        rarity: [1, 2, 3, 4, 5, 6, 7, 8],
        gender: ['male', 'female', 'other'],
        hasGeneralSkill: ['ls', 'es', 'bb', 'sbb', 'ubb'],
      };
    },
    sortUnitsBy(type) {
      if (this.sortingOptions[type]) {
        this.sortingOptions[type]();
      }
    },
    getSortButtonClass(key) {
      return { 'ui fluid padded button': true, positive: key === this.currentSortOption };
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
    removeIndex(targetArray = [], index) {
      return [
        ...(targetArray.slice(0, index)),
        ...(targetArray.slice(index + 1)),
      ];
    },
    toggleRarity(rarity) {
      const rarityIndex = this.filterOptions.rarity.indexOf(rarity);
      const currentFilter = this.filterOptions.rarity.slice();
      if (rarityIndex === -1) { // add rarity
        currentFilter.push(rarity);
        this.filterOptions.rarity = currentFilter.sort();
      } else {
        this.filterOptions.rarity = this.removeIndex(currentFilter, rarityIndex);
      }
      this.updateUnitList();
    },
    toggleElement(element) {
      const elementIndex = this.filterOptions.elements.indexOf(element);
      const currentFilter = this.filterOptions.elements.slice();
      const defaultOrder = this.getDefaultFilters().elements;
      if (elementIndex === -1) {
        currentFilter.push(element);
        this.filterOptions.elements = currentFilter.sort((a, b) => {
          const indexA = defaultOrder.indexOf(a);
          const indexB = defaultOrder.indexOf(b);
          const result = indexA - indexB;
          return result;
        });
      } else {
        this.filterOptions.elements = this.removeIndex(currentFilter, elementIndex);
      }
      this.updateUnitList();
    },
    toggleGender(gender) {
      const genderIndex = this.filterOptions.gender.indexOf(gender);
      const currentFilter = this.filterOptions.gender.slice();
      const defaultOrder = this.getDefaultFilters().gender;
      if (genderIndex === -1) {
        currentFilter.push(gender);
        this.filterOptions.gender = currentFilter.sort((a, b) => {
          const indexA = defaultOrder.indexOf(a);
          const indexB = defaultOrder.indexOf(b);
          const result = indexA - indexB;
          return result;
        });
      } else {
        this.filterOptions.gender = this.removeIndex(currentFilter, genderIndex);
      }
      this.updateUnitList();
    },
    doesUnitFitFilter(id) {
      const unit = this.getUnit(id);
      if (this.filterOptions.elements.indexOf(unit.element) === -1) {
        return false;
      } else if (this.filterOptions.rarity.indexOf(+unit.rarity) === -1) {
        return false;
      } else if (this.filterOptions.gender.indexOf(unit.gender) === -1) {
        return false;
      }

      return true;
    },
    updateUnitList() {
      // eslint-disable-next-line
      console.log("Current Filters", this.filterOptions);
      this.unitIDs = Object.keys(this.fullUnitData)
        .filter(id => id !== '1').filter(this.doesUnitFitFilter);
      this.sortUnitsBy(this.currentSortOption);
    },
  },
};
</script>

<style>
#units-container #unit-list {
  margin: 0 auto;
}

#units-container #options-section {
  position: fixed;
  left: 5rem;
  right: 5rem;
  top: 3rem;
  z-index: 50;
}

@media only screen and (max-width: 767px) {
  #units-container #sort-popup {
    min-width: 75%;
  }

  #units-container #options-section {
    left: 1.5rem;
    right: 1.5rem;
  }
}

#units-container #sort-popup .four.wide.column {
  padding-bottom: 1rem;
}

#units-container .ui.cards#unit-list {
  display: inline-flex !important;
  margin-top: 4rem;
}

#units-container .hidden {
  display: none;
}

#units-container #filter-panel #elements .ui.button,
#units-container #filter-panel #gender .ui.button {
  text-transform: capitalize;
}
</style>
