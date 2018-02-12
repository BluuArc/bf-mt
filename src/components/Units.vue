<template>
  <div id="units-container">
    <div v-show="fullUnitData === undefined">Loading unit data</div>
    <div v-show="fullUnitData !== undefined" class="ui container">
      <div class="ui cards" id="unit-list">
        <div :class='getCardClass(unit.element)'
          v-for="unit in fullUnitData"
          :key="unit.id">
          <div class="content left aligned">
            <img class="floated mini ui image" :src='getImageURL(unit.id)'>
            <div class="header">{{ unit.guide_id }}: {{ unit.name }}</div>
            <div class="meta">
              {{ getRarity(unit.rarity) }},
              {{ unit.element }},
              {{ unit.gender }}
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
  },
};
</script>

<style>
#units-container #unit-list {
  margin: 0 auto;
}
</style>
