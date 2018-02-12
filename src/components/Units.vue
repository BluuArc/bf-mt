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
        <div :class='getCardClass(getUnit(id).element)'
          v-for="id in unitIDs"
          :key="id">
          <div class="content left aligned">
            <img class="floated mini ui image" :src='getImageURL(getUnit(id).id)'>
            <div class="header">{{ getUnit(id).guide_id }}: {{ getUnit(id).name }}</div>
            <div class="meta">
              {{ getRarity(getUnit(id).rarity) }},
              {{ getUnit(id).element }},
              {{ getUnit(id).gender }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['fullUnitData'],
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
      elementColor: {
        fire: 'red',
        water: 'blue',
        earth: 'green',
        thunder: 'yellow',
        light: 'gray',
        dark: 'purple',
      },
      unitIDs: [],
      doSortByUnitID: true,
    };
  },
  methods: {
    /* eslint-disable */
    getImageURL(id) {
      return `http://dlc.bfglobal.gumi.sg/content/unit/img/unit_ills_thum_${id}.png`;
      // return '';
    },
    getRarity(rarity) {
      return (+rarity === 8) ? 'OE' : `${rarity}*`;
    },
    getCardClass(element) {
      const classObject = { card: true };
      classObject[this.elementColor[element]] = true;
      return classObject;
    },
    sorUnitsByGuideID() {
      this.unitIDs.sort((idA, idB) => +this.getUnit(idA).guide_id - +this.getUnit(idB).guide_id);
    },
    sortUnitsByUnitID() {
      this.unitIDs.sort((idA, idB) => +idA - +idB);
    },
    getUnit(id) {
      return this.fullUnitData[id];
    }
  },
};
</script>

<style>
#units-container #unit-list {
  margin: 0 auto;
}
</style>
