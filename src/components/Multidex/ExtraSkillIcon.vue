<template>
  <generic-sprite-icon
    iconTitle="Extra Skill Icon"
    :style="inactive ? inactiveStyle : $attrs.style"
    :iconWidth="iconSize" :iconHeight="iconSize"
    :sheetWidth="sheetSize[0]" :sheetHeight="sheetSize[1]"
    :displayWidth="displaySize" :displayHeight="displaySize"
    :src="require('@/assets/ex_icon.png')"
    :iconX="0" :iconY="0"/>
</template>

<script>
import GenericSpriteIcon from '@/components/GenericSpriteIcon';

export default {
  props: {
    inactive: {
      type: Boolean,
      default: false,
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
    iconSize () {
      return 32;
    },
    sheetSize () {
      return [32, 32];
    },
    inactiveStyle () {
      return 'filter: brightness(75%) grayscale(100%)';
    },
  },
};
</script>
