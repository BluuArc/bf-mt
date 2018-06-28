<template>
  <img src="@/assets/karma_thum.png" :style="imgStyle" title="Karma"/>
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
