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
    <g class="tier-list-title-group" v-if="titleHeight > 0">
      <text
        v-if="titles.left"
        :x="titleFooterAlignmentConfig.left.x" :y="GENERAL_SVG_CONFIG.PADDING"
        alignment-baseline="hanging"
        :text-anchor="titleFooterAlignmentConfig.left.textAnchor"
        :font-size="GENERAL_SVG_CONFIG.TITLE_FONT_SIZE"
        :font-family="GENERAL_SVG_CONFIG.FONT_FAMILY"
        :style="headerFooterTextStyle"
        v-text="titles.left"
      />
      <text
        v-if="titles.middle"
        :x="titleFooterAlignmentConfig.middle.x" :y="GENERAL_SVG_CONFIG.PADDING"
        alignment-baseline="hanging"
        :text-anchor="titleFooterAlignmentConfig.middle.textAnchor"
        :font-size="GENERAL_SVG_CONFIG.TITLE_FONT_SIZE"
        :font-family="GENERAL_SVG_CONFIG.FONT_FAMILY"
        :style="headerFooterTextStyle"
        v-text="titles.middle"
      />
      <text
        v-if="titles.right"
        :x="titleFooterAlignmentConfig.right.x" :y="GENERAL_SVG_CONFIG.PADDING"
        alignment-baseline="hanging"
        :text-anchor="titleFooterAlignmentConfig.right.textAnchor"
        :font-size="GENERAL_SVG_CONFIG.TITLE_FONT_SIZE"
        :font-family="GENERAL_SVG_CONFIG.FONT_FAMILY"
        :style="headerFooterTextStyle"
        v-text="titles.right"
      />
    </g>
    <g
      class="tier-list-row"
      v-for="(category, i) in categoriesConfig"
      :key="category.key"
      :transform="`translate(10, ${i * GENERAL_SVG_CONFIG.BASE_ROW_HEIGHT + (i + 1) * GENERAL_SVG_CONFIG.PADDING + titleHeight})`"
    >
      <g class="tier-list-row__identifier-cell">
        <rect
          x="0" y="0"
          :width="GENERAL_SVG_CONFIG.CATEGORY_WIDTH" :height="GENERAL_SVG_CONFIG.BASE_ROW_HEIGHT"
          :style="getCategoryCellStyle(category)"
        />
        <text
          :x="GENERAL_SVG_CONFIG.CATEGORY_WIDTH / 2" :y="GENERAL_SVG_CONFIG.BASE_ROW_HEIGHT / 2"
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
          :width="baseTrackConfig.width" :height="GENERAL_SVG_CONFIG.BASE_ROW_HEIGHT"
          :style="baseTrackConfig.style"
        />
        <text>
          {{ category }}
        </text>
        <image
          v-for="(entry, j) in category.entries"
          :key="entry.name"
          :x="GENERAL_SVG_CONFIG.ENTRY_SIZE * j" y="0"
          :width="GENERAL_SVG_CONFIG.ENTRY_SIZE" :height="GENERAL_SVG_CONFIG.ENTRY_SIZE"
          :xlink:href="entry.base64Url"
          :href="entry.base64Url"
        />
      </g>
    </g>
    <g class="tier-list-footer-group">
      <text
        v-if="footers.left"
        :x="titleFooterAlignmentConfig.left.x" :y="overallHeight - GENERAL_SVG_CONFIG.PADDING - GENERAL_SVG_CONFIG.FOOTER_FONT_SIZE"
        alignment-baseline="hanging"
        :text-anchor="titleFooterAlignmentConfig.left.textAnchor"
        :font-size="GENERAL_SVG_CONFIG.FOOTER_FONT_SIZE"
        :font-family="GENERAL_SVG_CONFIG.FONT_FAMILY"
        :style="headerFooterTextStyle"
        v-text="footers.left"
      />
      <text
        v-if="footers.right"
        :x="titleFooterAlignmentConfig.right.x" :y="overallHeight - GENERAL_SVG_CONFIG.PADDING - GENERAL_SVG_CONFIG.FOOTER_FONT_SIZE"
        alignment-baseline="hanging"
        :text-anchor="titleFooterAlignmentConfig.right.textAnchor"
        :font-size="GENERAL_SVG_CONFIG.FOOTER_FONT_SIZE"
        :font-family="GENERAL_SVG_CONFIG.FONT_FAMILY"
        :style="headerFooterTextStyle"
        v-text="footers.right"
      />
    </g>
  </svg>
</template>

<script>
import colors from 'vuetify/es5/util/colors';
import { getDefaultCategories } from '@/modules/core/tier-list-creator';

const GENERAL_SVG_CONFIG = {
  ENTRY_SIZE: 70,
  MAX_ENTRIES_PER_ROW: 10,
  BASE_ROW_HEIGHT: 70,
  CATEGORY_WIDTH: 100,
  PADDING: 10,
  FONT_SIZE: '1em',
  FONT_FAMILY: 'Arial',
  TITLE_FONT_SIZE: 16 * 1.25, // 1.25em
  FOOTER_FONT_SIZE: 16 * 0.75, // 0.75em
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
        : getDefaultCategories();
    },
    titles () {
      return {
        left: this.value.titleLeft || 'Left Title',
        middle: this.value.titleMiddle || 'Middle Title',
        right: this.value.titleRight || 'Right Title',
      };
    },
    titleFooterAlignmentConfig () {
      const { getTitleFooterConfigForAlignment } = this;
      return {
        left: getTitleFooterConfigForAlignment(-1),
        middle: getTitleFooterConfigForAlignment(0),
        right: getTitleFooterConfigForAlignment(1),
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
      const titles = this.titles;
      return (!titles.left && !titles.middle && !titles.right)
        ? 0
        : [
          GENERAL_SVG_CONFIG.TITLE_FONT_SIZE,
          GENERAL_SVG_CONFIG.PADDING,
        ].reduce((acc, val) => acc + val, 0);
    },
    overallHeight () {
      const numCategories = this.categories.length;
      return [
        GENERAL_SVG_CONFIG.PADDING,
        this.titleHeight,
        GENERAL_SVG_CONFIG.BASE_ROW_HEIGHT * numCategories + (numCategories - 1) * GENERAL_SVG_CONFIG.PADDING,
        GENERAL_SVG_CONFIG.PADDING,
        GENERAL_SVG_CONFIG.FOOTER_FONT_SIZE,
        GENERAL_SVG_CONFIG.PADDING,
      ].reduce((acc, val) => acc + val, 0);
    },
    viewBox () {
      return `0 0 ${this.overallWidth} ${this.overallHeight}`;
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
          ? this.value.entries[i]
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
    footers () {
      return {
        left: this.value.footerLeft || 'Left Footer',
        right: this.value.footerRight || 'Made with the Brave Frontier Multi-Tool',
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
    getTitleFooterConfigForAlignment (alignment) {
      let leftOffset = GENERAL_SVG_CONFIG.PADDING;
      let textAnchor = 'start'; // left justify by default
      if (alignment === 0) { // center justify
        textAnchor = 'middle';
        leftOffset += this.overallWidth / 2;
      } else if (alignment > 0) { // right justify
        textAnchor = 'end';
        leftOffset = this.overallWidth - GENERAL_SVG_CONFIG.PADDING;
      }
      return {
        x: leftOffset,
        textAnchor,
      };
    },
  },
};
</script>
