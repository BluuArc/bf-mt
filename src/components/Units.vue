<template>
  <div id="units-container">
    <div v-show="fullUnitData === undefined">Loading unit data</div>
    <div v-if="fullUnitData !== undefined && fullUnitData.error === undefined"
      class="ui container">
      <large-unit-card :unitData="selectedUnit"></large-unit-card>
      <div id="options-section">
        <div class='ui attached menu' id="options">
          <a class='ui left floated button item'
            id='sort-button' data-position="bottom left">
            Sort Options
          </a>
          <a class='ui floated item'
            @click="showFilterPanel = !showFilterPanel"
            id='filter-button'>
            <i class='icon filter'/>
          </a>
          <div class="item">
            <div class='ui transparent icon input'>
              <input type="text" v-model="nameQuery"
                placeholder="Enter Unit Name...">
              <i class='link icon plus'
                v-show="nameQuery.length > 0"
                @click="nameQuery = ''"/>
            </div>
          </div>
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
            <div class='ui segment' id="filterOptions">
              <div class='header'><b>General Filter</b></div>
              <div class='ui six compact buttons'>
                <button  @click="resetFilter()" class="ui button">
                    Enable All
                </button>
                <button  @click="disableAllFilters()" class="ui button">
                    Disable All
                </button>
              </div>
            </div>
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
            <div class='ui segment' id="generalSkill">
              <div class='header'><b>General Skills</b></div>
              <div class='ui six compact buttons'>
                <button v-for="value in getDefaultFilters().generalSkill" :key="value"
                  @click="toggleGeneralSkill(value)"
                  :class="{
                      'ui button': true,
                      green: filterOptions.generalSkill.indexOf(value) > -1
                    }">
                    {{ value }}
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="unit-list">
        <div class="ui secondary menu">
          <div class='ui green icon buttons left floated'>
            <button @click="indexStart = 0"
              :class="{
                'ui button': true,
                disabled: currentPage === 1,
                green: currentPage !== 1
              }">
              <i class='icon angle double left'/>
            </button>
            <button @click="indexStart -= amountToList"
              :class="{
                'ui button': true,
                disabled: currentPage === 1,
                green: currentPage !== 1
              }">
              <i class='icon angle left'/>
            </button>
            <button @click="indexStart += amountToList"
              :class="{
                'ui button': true,
                disabled: currentPage === totalPages,
                green: currentPage !== totalPages
              }">
              <i class='icon angle right'/>
            </button>
            <button @click="indexStart = unitIDs.length"
              :class="{
                'ui button': true,
                disabled: currentPage === totalPages,
                green: currentPage !== totalPages
              }">
              <i class='icon angle double right'/>
            </button>
          </div>
          <button class='ui right floated button item'
            data-position="bottom right" id="page-button">
            Page {{ currentPage }} of {{ totalPages }}
            <i class="caret down icon"/>
          </button>
          <div class='ui popup hidden' id='page-list-popup'>
            <div>
              Show
              <span class='ui input'>
                <input type="text" v-model="amountToList">
              </span>
              units per page
            </div>
            <button class='ui fluid button'
              @click="amountToList = 25">
              Reset
            </button>
          </div>
        </div>
        <transition-group name="fade" mode="out-in">
          <div class="ui three stackable cards" :key="pagedIDs[0] || 'none'">
            <small-unit-card
              v-for="id in pagedIDs"
              :key="id"
              :unitData='getUnit(id)'
              v-on:unit-select="setSelectedUnit"></small-unit-card>
          </div>
        </transition-group>
        <div class="ui secondary menu"
          v-show="pagedIDs.length > 0">
          <div class='ui fluid green icon buttons'>
            <button @click="indexStart = 0"
              :class="{
                'ui button': true,
                disabled: currentPage === 1,
                green: currentPage !== 1
              }">
              <i class='icon angle double left'/>
            </button>
            <button @click="indexStart -= amountToList"
              :class="{
                'ui button': true,
                disabled: currentPage === 1,
                green: currentPage !== 1
              }">
              <i class='icon angle left'/>
            </button>
            <button @click="indexStart += amountToList"
              :class="{
                'ui button': true,
                disabled: currentPage === totalPages,
                green: currentPage !== totalPages
              }">
              <i class='icon angle right'/>
            </button>
            <button @click="indexStart = unitIDs.length"
              :class="{
                'ui button': true,
                disabled: currentPage === totalPages,
                green: currentPage !== totalPages
              }">
              <i class='icon angle double right'/>
            </button>
          </div>
        </div>
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

/* global $ _ */
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

    $(this.$el).find('#page-button').popup({
      popup: $(this.$el).find('#page-list-popup'),
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
    unitIDs() {
      this.updatePagedUnitIDs();
    },
    pagedIDs(newValue) {
      if (newValue.length > this.amountToList) {
        this.updatePagedUnitIDs();
      }
    },
    currentSortOption(newKey) {
      this.sortUnitsBy(newKey);
    },
    doSortDescending() {
      this.sortUnitsBy(this.currentSortOption);
    },
    indexStart(newValue) {
      if (newValue >= this.unitIDs.length) {
        this.indexStart = this.amountToList * (this.totalPages - 1);
      } else if (newValue < 0) {
        this.indexStart = 0;
      }
      this.scrollToTop();
      this.updatePagedUnitIDs();
    },
    amountToList(newValue) {
      if (typeof newValue === 'string') {
        this.amountToList = +newValue;
        return;
      }
      if (newValue < 0) {
        this.amountToList = 0;
      } else if (newValue >= this.unitIDs.length) {
        this.amountToList = this.unitIDs.length;
      }
      this.indexStart = 0;
      this.updatePagedUnitIDs();
    },
    nameQuery: _.debounce(
      function onChange() {
        this.updateUnitList();
      },
      250,
    ),
  },
  computed: {
    ascendingClass() {
      return { 'ui button': true, positive: !this.doSortDescending };
    },
    descendingClass() {
      return { 'ui button': true, positive: this.doSortDescending };
    },
    currentPage() {
      return Math.floor(this.indexStart / this.amountToList) + 1;
    },
    totalPages() {
      return Math.ceil(this.unitIDs.length / this.amountToList);
    },
  },
  data() {
    return {
      unitIDs: [],
      pagedIDs: [],
      elements: ['fire', 'water', 'earth', 'thunder', 'light', 'dark'],
      currentSortOption: 'Unit ID',
      selectedUnit: {},
      nameQuery: '',
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
      indexStart: 0,
      amountToList: 25,
    };
  },
  methods: {
    getDefaultFilters() {
      return {
        elements: ['fire', 'water', 'earth', 'thunder', 'light', 'dark'],
        rarity: [1, 2, 3, 4, 5, 6, 7, 8],
        gender: ['male', 'female', 'other'],
        generalSkill: ['ls', 'es', 'bb', 'sbb', 'ubb'],
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
    sortByArrayOrder(defaultOrder = []) {
      return (a, b) => {
        const indexA = defaultOrder.indexOf(a);
        const indexB = defaultOrder.indexOf(b);
        const result = indexA - indexB;
        return result;
      };
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
        this.filterOptions.elements = currentFilter.sort(this.sortByArrayOrder(defaultOrder));
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
        this.filterOptions.gender = currentFilter.sort(this.sortByArrayOrder(defaultOrder));
      } else {
        this.filterOptions.gender = this.removeIndex(currentFilter, genderIndex);
      }
      this.updateUnitList();
    },
    toggleGeneralSkill(skill) {
      const skillIndex = this.filterOptions.generalSkill.indexOf(skill);
      const currentFilter = this.filterOptions.generalSkill.slice();
      const defaultOrder = this.getDefaultFilters().generalSkill;
      if (skillIndex === -1) {
        currentFilter.push(skill);
        this.filterOptions.generalSkill = currentFilter.sort(this.sortByArrayOrder(defaultOrder));
      } else {
        this.filterOptions.generalSkill = this.removeIndex(currentFilter, skillIndex);
      }
      this.updateUnitList();
    },
    /* eslint-disable */
    doesUnitFitFilter(id) {
      const unit = this.getUnit(id);
      const filterSkills = this.filterOptions.generalSkill;
      const allSkills = this.getDefaultFilters().generalSkill;
      const hasName = unit.name.toLowerCase().indexOf(this.nameQuery) > -1;

      let skillBoolean;
      if (filterSkills.length > 0) { //check for a specific skill
        filterSkills.forEach((skill) => {
          if (unit[skill] !== undefined) {
            skillBoolean = true;
          }
        });
      } else { // check for units with no skill
        let hasSomeSkill = false;
        allSkills.forEach((skill) => {
          if (unit[skill] !== undefined) {
            hasSomeSkill = true;
          }
        });

        skillBoolean = !hasSomeSkill;
      }

      if (this.filterOptions.elements.indexOf(unit.element) === -1) {
        return false;
      } else if (this.filterOptions.rarity.indexOf(+unit.rarity) === -1) {
        return false;
      } else if (this.filterOptions.gender.indexOf(unit.gender) === -1) {
        return false;
      } else if (!skillBoolean) {
        return false;
      } else if (this.nameQuery.length > 0 && !hasName) {
        return false;
      }

      return true;
    },
    updateUnitList() {
      this.unitIDs = Object.keys(this.fullUnitData)
        .filter(id => id !== '1').filter(this.doesUnitFitFilter);
      this.sortUnitsBy(this.currentSortOption);
    },
    resetFilter() {
      this.filterOptions = this.getDefaultFilters();
      this.updateUnitList();
    },
    disableAllFilters() {
      Object.keys(this.filterOptions).forEach((key) => {
        this.filterOptions[key] = [];
      });

      this.updateUnitList();
    },
    updatePagedUnitIDs: _.debounce(
      function () {
        this.pagedIDs = this.unitIDs.slice(this.indexStart, this.indexStart + this.amountToList);
      },
      250
    ),
    scrollToTop() {
      const $el = $(this.$el);
      $el.animate({ scrollTop: 0 }, 1000);
    },
  },
};
</script>

<style>
#units-container #unit-list {
  margin: 0 auto;
  width: 100%;
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

#units-container #unit-list {
  margin-top: 4rem;
}

#units-container #unit-list .ui.card {
  display: inline-flex !important;
}

#units-container .hidden {
  display: none;
}

#units-container #filter-panel #elements .ui.button,
#units-container #filter-panel #gender .ui.button {
  text-transform: capitalize;
}

#units-container #filter-panel #generalSkill .ui.button {
  text-transform: uppercase;
}

#units-container #page-list-popup .ui.input {
  width: 5rem;
}

/* based off of https://vuejs.org/v2/guide/transitions.html#Transitioning-Single-Elements-Components */
.fade-enter-active, .fade-leave-active {
  transition: opacity .25s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

#units-container i.icon.angle {
  font-size: 1.5rem;
}

#units-container i.icon.plus {
  transform: rotate(45deg);
}
</style>
