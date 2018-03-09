<template>
  <div :class='getCardClass(unitData.element)'
    @click="emitUnitID(unitData.id)" id="small-unit-card"
  >
    <div class="content left aligned">
      <img class="floated mini ui image" :src='getImageURL(unitData.id)'>
      <div class="header">{{ unitData.guide_id }}: {{ unitData.name }}</div>
      <div class="meta">
        {{ getRarity(unitData.rarity) }},
        {{ unitData.element }},
        {{ unitData.gender }}
      </div>
    </div>
  </div>
</template>

<script>
import { storeMethods } from '@/store';

export default {
  props: ['unitData'],
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
    getCardClass(unitElement) {
      const classObject = { card: true };
      classObject[this.elementColor[unitElement]] = true;
      return classObject;
    },
    /* eslint-disable */
    getImageURL(id) {
      if (location.hostname === 'localhost') {
        return '';
      } else {
        return storeMethods.getUnitImageURLs(this.$store.state, id).ills_thum;
      }
    },
    getRarity(rarity) {
      return (+rarity === 8) ? 'OE' : `${rarity}*`;
    },
    emitUnitID(id) {
      this.$emit('unit-select', id);
    },
  },
};
</script>

<style>
#small-unit-card {
  user-select: none;
}

#small-unit-card:hover {
  background: lightgray;
}
</style>
