<template>
  <svg
    width="100%" height="100%"
    :viewBox="viewBox"
    preserveAspectRatio="xMinYMax meet"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    class="tier-list-svg"
    :style="mainSvgStyle"
  >
    <g class="title" v-if="titleHeight > 0">
      <text
        :x="titleConfig.x" :y="GENERAL_SVG_CONFIG.PADDING"
        alignment-baseline="hanging"
        :text-anchor="titleConfig.textAnchor"
        :font-size="GENERAL_SVG_CONFIG.TITLE_FONT_SIZE"
        :font-family="GENERAL_SVG_CONFIG.FONT_FAMILY"
        :style="headerFooterTextStyle"
        v-text="title"
      />
    </g>
    <g
      class="tier-list-row"
      v-for="(category, i) in categoriesConfig"
      :key="category.key"
      :transform="`translate(10, ${i * GENERAL_SVG_CONFIG.ROW_HEIGHT + (i + 1) * GENERAL_SVG_CONFIG.PADDING + titleHeight})`"
    >
      <g class="tier-list-row__identifier-cell">
        <rect
          x="0" y="0"
          :width="GENERAL_SVG_CONFIG.CATEGORY_WIDTH" :height="GENERAL_SVG_CONFIG.ROW_HEIGHT"
          :style="getCategoryCellStyle(category)"
        />
        <text
          :x="GENERAL_SVG_CONFIG.CATEGORY_WIDTH / 2" :y="GENERAL_SVG_CONFIG.ROW_HEIGHT / 2"
          text-anchor="middle"
          alignment-baseline="middle"
          :font-size="GENERAL_SVG_CONFIG.FONT_SIZE"
          :font-family="GENERAL_SVG_CONFIG.FONT_FAMILY"
          :style="getCategoryTextStyle(category)"
          v-text="category.name"
        />
      </g>
      <g class="tier-list-row__entry-track" transform="translate(110, 0)">
        <rect
          x="0" y="0"
          :width="baseTrackConfig.width" :height="GENERAL_SVG_CONFIG.ROW_HEIGHT"
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

const GENERAL_SVG_CONFIG = {
  ENTRY_SIZE: 64,
  MAX_ENTRIES_PER_ROW: 10,
  ROW_HEIGHT: 70,
  CATEGORY_WIDTH: 100,
  PADDING: 10,
  FONT_SIZE: '1em',
  FONT_FAMILY: 'Arial',
  TITLE_FONT_SIZE: 16 * 1.25, // 1.25em
};

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
    categories () {
      return Array.isArray(this.value.categories)
        ? this.value.categories
        : DEFAULT_CATEGORIES_CONFIG;
    },
    title () {
      return this.value.title || 'Test Title';
    },
    titleAlignment () {
      let result = 0;
      const titleAlignment = !isNaN(this.value.titleAlignment) ? +this.value.titleAlignment : 0;
      if (titleAlignment < 0) {
        result = -1;
      } else if (titleAlignment > 0) {
        result = 1;
      }
      return result;
    },
    titleConfig () {
      let leftOffset = GENERAL_SVG_CONFIG.PADDING;
      let textAnchor = 'start';
      if (this.titleAlignment === 0) { // center justify
        textAnchor = 'middle';
        leftOffset += this.overallWidth / 2;
      } else if (this.titleAlignment === 1) {
        textAnchor = 'end';
        leftOffset = this.overallWidth - GENERAL_SVG_CONFIG.PADDING;
      }
      return {
        x: leftOffset,
        textAnchor,
      };
    },
    GENERAL_SVG_CONFIG: () => GENERAL_SVG_CONFIG,
    overallWidth () {
      return [
        GENERAL_SVG_CONFIG.PADDING,
        GENERAL_SVG_CONFIG.CATEGORY_WIDTH,
        GENERAL_SVG_CONFIG.PADDING,
        GENERAL_SVG_CONFIG.MAX_ENTRIES_PER_ROW * GENERAL_SVG_CONFIG.ENTRY_SIZE,
        GENERAL_SVG_CONFIG.PADDING,
      ].reduce((acc, val) => acc + val, 0);
    },
    titleHeight () {
      return !this.title
        ? 0
        : [
          GENERAL_SVG_CONFIG.TITLE_FONT_SIZE,
          GENERAL_SVG_CONFIG.PADDING,
        ].reduce((acc, val) => acc + val, 0);
    },
    viewBox () {
      const numCategories = this.categories.length;
      const width = this.overallWidth;
      const height = [
        GENERAL_SVG_CONFIG.PADDING,
        this.titleHeight,
        GENERAL_SVG_CONFIG.ROW_HEIGHT * numCategories + (numCategories - 1) * GENERAL_SVG_CONFIG.PADDING,
        GENERAL_SVG_CONFIG.PADDING,
      ].reduce((acc, val) => acc + val, 0);

      return `0 0 ${width} ${height}`;
    },
    baseTrackConfig () {
      return {
        width: this.overallWidth - GENERAL_SVG_CONFIG.CATEGORY_WIDTH - 3 * GENERAL_SVG_CONFIG.PADDING, // fill width - category cell width - 3x padding (left padding of category + left and right padding of track)
        style: {
          fill: colors.grey.darken3,
        },
      };
    },
    categoriesConfig () {
      return this.categories.map((c, i) => {
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
    headerFooterTextStyle () {
      return {
        fill: '#fff',
      };
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
