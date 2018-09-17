<template>
  <generic-sprite-icon
    :iconTitle="spCategory"
    :iconWidth="iconSize" :iconHeight="iconSize"
    :sheetWidth="sheetSize[0]" :sheetHeight="sheetSize[1]"
    :displayWidth="displaySize" :displayHeight="displaySize"
    :src="require('@/assets/sphere_icon_hexa.png')"
    :iconX="xCoord" :iconY="yCoord"/>
</template>

<script>
import GenericSpriteIcon from '@/components/GenericSpriteIcon';
import { getSpCategory } from '@/modules/core/units';

export default {
  props: {
    category: {
      type: Number,
      required: true,
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
    spCategory () {
      return getSpCategory(this.category);
    },
    iconSize () {
      return 32;
    },
    sheetSize () {
      return [192, 64];
    },
    xCoord () {
      const index = this.category <= 6 ? (this.category - 1) : (this.category - 7);
      return index * this.iconSize;
    },
    yCoord () {
      return this.iconSize * (this.category <= 6 ? 0 : 1);
    },
  },
};
</script>
