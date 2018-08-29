<template>
  <svg
    :width="displayWidth || iconWidth" :height="displayHeight || iconHeight"
    :viewBox="`0 0 ${iconWidth} ${iconHeight}`"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">
    <title v-if="iconTitle" v-text="iconTitle"/>
    <image
      :width="sheetWidth" :height="sheetHeight"
      :xlink:href="src"
      :transform="customTransform || defaultTransform"
    />
  </svg>
</template>

<script>
export default {
  props: {
    iconTitle: {
      type: String,
      default: '',
    },
    displayWidth: {
      type: Number,
      default: 0,
    },
    displayHeight: {
      type: Number,
      default: 0,
    },
    iconWidth: {
      type: Number,
      required: true,
    },
    iconHeight: {
      type: Number,
      required: true,
    },
    sheetWidth: {
      type: Number,
      required: true,
    },
    sheetHeight: {
      type: Number,
      required: true,
    },
    src: {
      type: String,
      required: true,
    },
    // top left X coordinate
    iconX: {
      type: Number,
      default: 0,
    },
    // top left Y coordinate
    iconY: {
      type: Number,
      default: 0,
    },
    customTransform: {
      type: String,
      default: '',
    },
  },
  computed: {
    defaultTransform () {
      const coords = [-this.iconX, this.iconY].join(' ');
      return `translate(${coords})`;
    },
  },
};
</script>

<style>

</style>
