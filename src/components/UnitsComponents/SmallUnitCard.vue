<template>
  <div :class='getCardClass(unitData.element)'>
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
      return `http://dlc.bfglobal.gumi.sg/content/unit/img/unit_ills_thum_${id}.png`;
      // return '';
    },
    getRarity(rarity) {
      return (+rarity === 8) ? 'OE' : `${rarity}*`;
    },
  },
};
</script>
