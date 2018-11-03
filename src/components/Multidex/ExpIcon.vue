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
    displaySize: {
      type: Number,
      default: 52,
    },
  },
  components: {
    GenericSpriteIcon,
  },
  computed: {
    label: () => 'EXP',
    iconSrc () {
      return require('@/assets/exp_summoner_thum.png');
    },
    iconSize () {
      return 800;
    },
    sheetSize () {
      return [800, 800];
    },
  },
};
</script>
