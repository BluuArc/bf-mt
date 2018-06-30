<template>
  <i class="icon bf sp">
    <img
      src="@/assets/sphere_icon_hexa.png"
      :title="getSPCategory(category)"
      :class="imgClass"
      :style="{
        'clip-path': `circle(16px at ${xClip + 16}px ${yClip + 16}px`,
        '-webkit-clip-path': `circle(16px at ${xClip + 16}px ${yClip + 16}px`,
        position: 'absolute',
        left: `${-xClip}px`,
        top: `${-yClip}px`
      }">
  </i>
</template>

<script>
export default {
  props: ['category', 'imgClass'],
  computed: {
    xClip () {
      const category = +this.category <= 6 ? (+this.category - 1) : (+this.category - 7);
      return category * 32;
    },
    yClip () {
      const category = +this.category;
      return 32 * (category <= 6 ? 0 : 1);
    },
  },
  methods: {
    getSPCategory (num) {
      const categories = {
        1: 'Parameter Boost',
        2: 'Spark',
        3: 'Critical Hits',
        4: 'Attack Boost',
        5: 'BB Gauge',
        6: 'HP Recovery',
        7: 'Drops',
        8: 'Ailment Resistance',
        9: 'Ailment Infliction',
        10: 'Damage Reduction',
        11: 'Special',
      };
      return categories[+num];
    },
  },
};
</script>

<style>
.icon.bf.sp {
  position: relative;
  width: calc(32px * 0.75);
  height: 1.5rem;
  transform: scale(0.75);
  display: inline-block;
  margin: 0 0.25em;
}

.icon.bf.sp img {
  margin-top: -0.45em;
  margin-left: -0.25rem;
}
</style>
