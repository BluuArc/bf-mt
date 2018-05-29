<template>
  <i class="icon bf sphere-type">
    <img
      src="@/assets/sphere_icon.png"
      :title="getSphereCategory(inputCategory)"
      :class="imgClass"
      :style="{
        'clip-path': `circle(16px at ${xClip + 16}px ${yClip + 16}px`,
        position: 'absolute',
        left: `${-xClip}px`,
        top: `${-yClip}px`
      }">
  </i>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: ['category', 'imgClass'],
  computed: {
    ...mapGetters('items', ['getSphereCategory']),
    inputCategory () {
      return !isNaN(this.category) ? +this.category : 0;
    },
    xClip () {
      const category = this.inputCategory <= 9 ? (this.inputCategory) : (this.inputCategory - 10);
      return category * 32;
    },
    yClip () {
      const category = this.inputCategory;
      return 32 * (category <= 9 ? 0 : 1);
    },
  },
};
</script>

<style>
.icon.bf.sphere-type {
  position: relative;
  width: calc(32px * 0.75);
  height: 1.5rem;
  transform: scale(0.75);
  display: inline-block;
  margin: 0 0.25em;
}

.icon.bf.sphere-type img {
  margin-top: -0.20em;
  margin-left: -0.25rem;
}
</style>
