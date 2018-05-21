<template>
  <div :class='getCardClass(unitData.element)'
    @click="emitUnitID(unitData.id)" id="small-unit-card"
  >
    <div class="content left aligned">
      <lazy-load-thumbnail
        :rarity="unitData.rarity"
        :imgClass="{ 'floated ui image unit-thum': true }"
        :src='getImageURL(unitData.id)'/>
      <div class="header" id="line-one">
        <element-icon :element="unitData.element"/>
        <span>{{ unitData.name }}</span>
        <div class="right floated">
          <span v-if="unitData.rarity < 8">
            {{ unitData.rarity }}
            <img class="ui image bf" src="@/assets/star_rare.png"/>
          </span>
          <img v-else class="ui image bf" src="@/assets/phantom_icon.png"/>
        </div>
      </div>
      <div class="header" id="line-two">
        # {{ unitData.guide_id }}
        <span
            class="right floated"
            v-html="getGenderIcon(unitData.gender)"/>
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
      return `<i class="${iconMapping[gender]} icon"></i>`;
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

#small-unit-card img.bf {
  max-width: 1.25rem;
  margin-top: -0.25rem;
}

#small-unit-card .unit-thum {
  height: 3.5rem;
  width: auto;
}

#small-unit-card #line-two {
  margin-top: 0.25em
}

#small-unit-card #line-two .icon {
  margin-right: -0.15em;
}
</style>
