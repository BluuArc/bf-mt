<template>
  <svg
    :width="displaySize" :height="displaySize"
    :viewBox="`0 0 ${iconSize} ${iconSize}`"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">
    <title v-if="iconKey" v-text="iconKey"/>
    <template v-if="false">
      test
      <!-- <image
        :width="sheetWidth" :height="sheetHeight"
        :xlink:href="src"
        :href="src"
        :transform="customTransform || defaultTransform"
      /> -->
    </template>
    <template v-else>
      <image
        :xlink:href="require('@/assets/item_frame_bg2.png')"
        :width="iconSize" :height="iconSize"
        class="buff-background"/>
      <image
        :xlink:href="require('@/assets/buff-translation/raid/raid_room_shadow_question.png')"
        :width="iconSize" :height="iconSize"/>
    </template>
  </svg>
</template>

<script>
export default {
  props: {
    iconKey: {
      type: String,
      default: '',
    },
    displaySize: {
      type: Number,
      default: 32,
    },
  },
  computed: {
    iconSize () {
      return 32;
    },
  },
};
</script>

<style>

</style>
