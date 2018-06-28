<template>
  <img src="@/assets/exp_summoner_thum.png" :style="imgStyle" title="XP"/>
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
