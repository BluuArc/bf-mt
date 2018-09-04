<template>
  <generic-sprite-icon
    :iconTitle="label"
    :iconWidth="iconSize" :iconHeight="iconSize"
    :sheetWidth="sheetSize[0]" :sheetHeight="sheetSize[1]"
    :displayWidth="displaySize" :displayHeight="displaySize"
    :src="iconSrc"
    :iconX="0" :iconY="0"/>
</template>

<script>
import GenericSpriteIcon from '@/components/GenericSpriteIcon';

export default {
  props: {
    rarity: {
      type: Number,
      required: true,
    },
    displaySize: {
      type: Number,
      default: 52,
    },
  },
  components: {
    GenericSpriteIcon,
  },
  computed: {
    isOmni () {
      return this.rarity === 8;
    },
    label () {
      return this.isOmni ? 'Omni Evolution' : `${this.rarity} Star`;
    },
    iconSrc () {
      return this.isOmni ? require('@/assets/phantom_icon.png') : require('@/assets/star_rare.png');
    },
    iconSize () {
      return 52;
    },
    sheetSize () {
      return [52, 52];
    },
  },
};
</script>
