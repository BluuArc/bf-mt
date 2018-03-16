<template>
  <span class="icon bf element">
    <img
      src="@/assets/attribute_mark_L.png"
      :title="element"
      :class="imgClass"
      :style="{
        'clip-path': `circle(26px at ${xClip + 26}px 26px`,
        position: 'absolute',
        left: `${-xClip - 26}px`,
        top: `0px`
      }">
  </span>
</template>

<script>
export default {
  props: ['element', 'imgClass'],
  computed: {
    elements: () => ['fire', 'water', 'earth', 'thunder', 'light', 'dark'],
    xClip() {
      const index = this.elements.indexOf(this.element.toLowerCase());
      return index * 52;
    },
  },
};
</script>

<style>
.icon.bf.element {
  position: relative;
  width: calc(52px * 0.25);
  height: 3vh;
  transform: scale(0.4);
  display: inline-block;
}
</style>
