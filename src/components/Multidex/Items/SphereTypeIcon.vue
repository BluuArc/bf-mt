<template>
  <generic-sprite-icon
    :iconTitle="sphereCategory"
    :iconWidth="iconSize" :iconHeight="iconSize"
    :sheetWidth="sheetSize[0]" :sheetHeight="sheetSize[1]"
    :displayWidth="displaySize" :displayHeight="displaySize"
    :src="require('@/assets/sphere_icon.png')"
    :iconX="xCoord" :iconY="yCoord"/>
</template>

<script>
import GenericSpriteIcon from '@/components/GenericSpriteIcon';
import { getSphereCategory } from '@/modules/core/items';

export default {
  props: {
    category: {
      type: Number,
      default: 0,
    },
    displaySize: {
      type: Number,
      default: 32,
    },
  },
  components: {
    GenericSpriteIcon,
  },
  computed: {
    sphereCategory () {
      return getSphereCategory(this.category);
    },
    iconSize () {
      return 32;
    },
    sheetSize () {
      return [320, 64];
    },
    xCoord () {
      const index = this.category <= 9 ? (this.category) : (this.category - 10);
      return index * this.iconSize;
    },
    yCoord () {
      return this.iconSize * (this.category <= 9 ? 0 : 1);
    },
  },
};
</script>
