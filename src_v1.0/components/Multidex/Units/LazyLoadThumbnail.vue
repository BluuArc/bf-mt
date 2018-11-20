<template>
  <span>
    <!-- need to hardcode all lazy elements to allow better webpack exporting -->
    <img
      id="lazy-load"
      src="@/assets/question_frame_2.png"
      v-if="rarity === 3"
      :class="imgClass"
      :style="imgStyle"
      :align="align"
      :title="title"
      :alt="alt"/>
    <img
      id="lazy-load"
      src="@/assets/question_frame_3.png"
      v-else-if="rarity === 4"
      :class="imgClass"
      :style="imgStyle"
      :align="align"
      :title="title"
      :alt="alt"/>
    <img
      id="lazy-load"
      src="@/assets/question_frame_4.png"
      v-else-if="rarity >= 5"
      :class="imgClass"
      :style="imgStyle"
      :align="align"
      :title="title"
      :alt="alt"/>
    <img
      id="lazy-load"
      src="@/assets/question_frame_1.png"
      v-else
      :class="imgClass"
      :style="imgStyle"
      :align="align"
      :title="title"
      :alt="alt"/>
    <img
      id="actual"
      :class="imgClass"
      :style="imgStyle"
      :align="align"
      :src="src"
      :title="title"
      :alt="alt"/>
  </span>
</template>

<script>
export default {
  props: ['imgClass', 'imgStyle', 'src', 'rarity', 'title', 'alt', 'align'],
  mounted () {
    const lazyLoadImage = this.$el.querySelector('img#lazy-load');
    const actualImage = this.$el.querySelector('img#actual');

    lazyLoadImage.style.display = 'initial';
    actualImage.style.display = 'none';

    actualImage.onload = () => {
      lazyLoadImage.style.display = 'none';
      actualImage.style.display = '';
    };
  },
};
</script>
