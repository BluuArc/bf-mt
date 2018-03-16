<template>
  <div :class='getCardClass(unitData.element)'
    @click="emitUnitID(unitData.id)" id="small-unit-card"
  >
    <div class="content left aligned">
      <lazy-load-thumbnail
        :rarity="unitData.rarity"
        :imgClass="{ 'floated mini ui image': true }"
        :src='getImageURL(unitData.id)'/>
      <div class="header">{{ unitData.guide_id }}: {{ unitData.name }}</div>
      <div class="meta">
        <span v-html="getRarity(unitData.rarity)"/>
        <element-icon :element="unitData.element"/>
        <span v-html="getGenderIcon(unitData.gender)"/>
      </div>
    </div>
  </div>
</template>

<script>
import { storeMethods } from '@/store';
import LazyLoadThumbnail from '@/components/UnitsComponents/LazyLoadThumbnail';
import ElementIcon from '@/components/UnitsComponents/ElementIcon';

export default {
  props: ['unitData'],
  components: {
    'lazy-load-thumbnail': LazyLoadThumbnail,
    'element-icon': ElementIcon,
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
      return (+rarity === 8) ? 'OE' : `${rarity}<i class="star icon"></i>`;
    },
    emitUnitID(id) {
      this.$emit('unit-select', id);
    },
    getGenderIcon(gender) {
      const iconMapping = {
        male: 'mars',
        female: 'venus',
        other: 'genderless',
      };
      return `<i class="${iconMapping[gender]} large icon"></i>`;
    }
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
