<template>
  <span>
    <!-- need to hardcode all lazy elements to allow better webpack exporting -->
    <img
      id="lazy-load"
      src="@/assets/question_frame_1.png"
      v-if="rarity <= 2"
      :class="imgClass"
      :title="title"
      :alt="alt"/>
    <img
      id="lazy-load"
      src="@/assets/question_frame_2.png"
      v-if="rarity === 3"
      :class="imgClass"
      :title="title"
      :alt="alt"/>
    <img
      id="lazy-load"
      src="@/assets/question_frame_3.png"
      v-if="rarity === 4"
      :class="imgClass"
      :title="title"
      :alt="alt"/>
    <img
      id="lazy-load"
      src="@/assets/question_frame_4.png"
      v-if="rarity >= 5"
      :class="imgClass"
      :title="title"
      :alt="alt"/>
    <img
      id="actual"
      :class="imgClass"
      :src="src"
      :title="title"
      :alt="alt"/>
  </span>
</template>

<script>
/* global $ */
export default {
  props: ['imgClass', 'src', 'rarity', 'title', 'alt'],
  computed: {
    lazyLoadSrc() {
      let filePrefix = '@/assets/question_frame_';
      if (+this.rarity >= 5) {
        filePrefix += '4';
      } else if (+this.rarity <= 2) {
        filePrefix += '1';
      } else {
        filePrefix += (+this.rarity - 1).toString();
      }
      return `${filePrefix}.png`;
    },
  },
  mounted() {
    const lazyLoadImage = $(this.$el).find('img#lazy-load');
    const actualImage = $(this.$el).find('img#actual');

    lazyLoadImage.css('display', 'initial');
    actualImage.css('display', 'none');

    actualImage.on('load', () => {
      lazyLoadImage.css('display', '');
      actualImage.css('display', '');
    });
  },
};
</script>

<style>
img#lazy-load {
  display: none;
}
</style>
