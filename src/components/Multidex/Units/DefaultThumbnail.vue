<template>
  <img src="@/assets/secret.png" :style="imgStyle" :title="text" :alt="text"/>
</template>

<script>
export default {
  props: {
    imgStyle: {
      type: String,
      default: 'height: 48px; width: 48px; vertical-align: middle;',
    },
    text: {
      type: String,
      default: 'Unknown Unit',
    },
  },
};
</script>
