<template>
  <img src="@/assets/gem_thum.png" :style="imgStyle" title="Gem"/>
</template>

<script>
export default {
  props: {
    imgStyle: {
      type: String,
      default: 'height: 36px; width: 36px; vertical-align: middle;',
    },
  },
};
</script>
