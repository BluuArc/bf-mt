<template>
  <generic-sprite-icon
    :iconTitle="element"
    :iconWidth="iconSize" :iconHeight="iconSize"
    :sheetWidth="sheetSize[0]" :sheetHeight="sheetSize[1]"
    :displayWidth="displaySize" :displayHeight="displaySize"
    :src="require('@/assets/attribute_mark_L.png')"
    :iconX="xCoord" :iconY="0"/>
</template>

<script>
import { elements } from '@/modules/constants';
import GenericSpriteIcon from '@/components/GenericSpriteIcon';

export default {
  props: {
    element: {
      type: String,
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
    iconSize () {
      return 52;
    },
    sheetSize () {
      return [312, 52];
    },
    xCoord () {
      const index = elements.indexOf(this.element.toLowerCase());
      return index * this.iconSize;
    },
  },
};
</script>
