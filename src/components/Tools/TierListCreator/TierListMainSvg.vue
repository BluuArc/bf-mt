<template>
  <svg
    width="100%" height="100%"
    viewBox="0 0 1366 200"
    preserveAspectRatio="xMinYMax meet"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    class="tier-list-svg"
    :style="mainSvgStyle"
  >
    <g
      class="tier-list-row"
      v-for="(category, i) in categoriesConfig"
      :key="category.key"
      :transform="`translate(10, ${i * 70 + (i + 1) * 10})`"
    >
      <g class="tier-list-row__identifier-cell">
        <rect
          x="0" y="0"
          width="100" height="70"
          :style="getCategoryCellStyle(category)"
        />
        <text
          x="50" y="35"
          text-anchor="middle"
          alignment-baseline="middle"
          font-size="1.5em"
          :style="getCategoryTextStyle(category)"
          v-text="category.name"
        />
      </g>
      <g class="tier-list-row__entry-track" transform="translate(110, 0)">
        <rect
          x="0" y="0"
          :width="baseTrackConfig.width" height="70"
          :style="baseTrackConfig.style"
        />
      </g>
    </g>
  </svg>
</template>

<script>
import colors from 'vuetify/es5/util/colors';
import { generateInput } from '@/modules/core/tier-list-creator';

const DEFAULT_CATEGORIES_CONFIG = [
  {
    name: "S",
    backgroundColor: colors.red.accent1,
    textColor: colors.shades.black,
  },
  {
    name: "A",
    backgroundColor: colors.orange.accent1,
    textColor: colors.shades.black,
  },
];

export default {
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  computed: {
    mainSvgStyle () {
      return {
        'background-color': colors.grey.darken4,
      };
    },
    baseTrackConfig () {
      return {
        width: 1366 - 110 - 10 - 10, // fill width - category cell width - 2x padding
        style: {
          fill: colors.grey.darken3,
        },
      };
    },
    categoriesConfig () {
      const categories = Array.isArray(this.value.categories)
        ? this.value.categories
        : DEFAULT_CATEGORIES_CONFIG;

      return categories.map((c, i) => {
        const name = c.name || `Category ${i + 1}`;
        // entries are keyed by index of category
        const associatedInput = (this.value.entries && Array.isArray(this.value.entries[i]))
          ? this.value.entries[i].map(generateInput).filter(entry => entry.type && entry.id)
          : [];
        return {
          name,
          backgroundColor: c.backgroundColor || colors.grey.lighten1,
          textColor: c.textColor || colors.shades.black,
          key: `${name}-${i}`,
          entries: associatedInput,
        };
      });
    },
  },
  methods: {
    getCategoryCellStyle (category) {
      return {
        fill: category.backgroundColor,
      };
    },
    getCategoryTextStyle (category) {
      return {
        fill: category.textColor,
      };
    },
  },
};
</script>
