<template>
  <generic-sprite-icon
    :iconTitle="label"
    :iconWidth="sheetSize[0]" :iconHeight="sheetSize[1]"
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
    label: () => 'Friend Unit',
    iconSrc () {
      return require('@/assets/battle_friend_icon.png');
    },
    sheetSize () {
      return [17, 22];
    },
  },
};
</script>
