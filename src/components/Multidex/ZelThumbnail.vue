<template>
  <img src="@/assets/zell_thum.png" :style="imgStyle" title="Zel"/>
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
