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
    label: () => 'Zel',
    iconSrc () {
      return require('@/assets/zell_thum.png');
    },
    iconSize () {
      return 102;
    },
    sheetSize () {
      return [102, 102];
    },
  },
};
</script>
