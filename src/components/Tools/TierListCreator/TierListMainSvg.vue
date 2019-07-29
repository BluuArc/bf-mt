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
      v-for="category in categoriesConfig"
      :key="category.key"
      :transform="`translate(10, ${category.yOffset})`"
    >
      <g class="tier-list-row__identifier-cell">
        <rect
          x="0" y="0"
          :width="GENERAL_SVG_CONFIG.CATEGORY_WIDTH" :height="category.trackHeight"
          :style="getCategoryCellStyle(category)"
        />
        <text
          :x="GENERAL_SVG_CONFIG.CATEGORY_WIDTH / 2" :y="category.trackHeight / 2"
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
          :width="baseTrackConfig.width" :height="category.trackHeight"
          :style="baseTrackConfig.style"
        />
        <template v-for="(entry, j) in category.entries">
          <image
            :key="`${JSON.stringify(entry)}-${j}-image`"
            :x="getEntryXOffset(j)" :y="getEntryYOffset(j)"
            :width="GENERAL_SVG_CONFIG.ENTRY_SIZE" :height="GENERAL_SVG_CONFIG.ENTRY_SIZE"
            :xlink:href="entry.base64Url || entry.imgUrl"
            :href="entry.base64Url || entry.imgUrl"
          />
          <g v-if="showEntryNames && entry.name" :key="`${JSON.stringify(entry)}-${j}-label`">
            <rect
              :x="getEntryXOffset(j)" :y="getEntryYOffset(j)"
              :width="GENERAL_SVG_CONFIG.ENTRY_SIZE" :height="GENERAL_SVG_CONFIG.ENTRY_SIZE"
              fill="black" style="fill-opacity: 0.5"
            />

            <flow-text
              :x="getEntryXOffset(j) + GENERAL_SVG_CONFIG.ENTRY_SIZE / 2" :y="getEntryYOffset(j) + GENERAL_SVG_CONFIG.ENTRY_SIZE / 2"
              fill="white"
              text-anchor="middle"
              alignment-baseline="middle"
              :flowText="entry.name"
              :flowMaxWidth="GENERAL_SVG_CONFIG.ENTRY_SIZE"
              :flowLineHeight="16"
              :flowX="getEntryXOffset(j) + GENERAL_SVG_CONFIG.ENTRY_SIZE / 2"
            />
          </g>
        </template>
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
import FlowText from '@/components/SvgFlowText';

const GENERAL_SVG_CONFIG = {
  ENTRY_SIZE: 70,
  MAX_ENTRIES_PER_ROW: 8, // TODO: make configurable
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
  components: {
    FlowText,
  },
  computed: {
    mainSvgStyle () {
      return {
        'background-color': colors.grey.darken4,
      };
    },
    showEntryNames () {
      return !!this.value.showEntryNames;
    },
    categories () {
      return Array.isArray(this.value.categories)
        ? this.value.categories
        : getDefaultCategories();
    },
    titles () {
      return {
        left: this.value.titleLeft || '',
        middle: this.value.titleMiddle || '',
        right: this.value.titleRight || '',
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
      const { categoriesConfig } = this;
      const categoryHeight = categoriesConfig.reduce((acc, val) => acc + val.trackHeight, 0);
      const paddingForCategories = Math.max(categoriesConfig.length - 1, 0) * GENERAL_SVG_CONFIG.PADDING;
      return [
        GENERAL_SVG_CONFIG.PADDING,
        this.titleHeight,
        categoryHeight + paddingForCategories,
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
      let extraHeight = 0;
      const { titleHeight } = this;
      let previousYOffset = 0;
      return this.categories.map((c, i) => {
        const name = c.name || `Category ${i + 1}`;
        // entries are keyed by index of category
        const associatedInput = (this.value.entries && Array.isArray(this.value.entries[i]))
          ? this.value.entries[i]
          : [];

        const yOffset = this.getEntryYOffset(Math.max(0, associatedInput.length - 1));
        if (previousYOffset > 0) {
          extraHeight += previousYOffset;
        }
        previousYOffset = yOffset;
        return {
          name,
          backgroundColor: c.backgroundColor || colors.grey.lighten1,
          textColor: c.textColor || colors.shades.black,
          key: `${name}-${i}`,
          entries: associatedInput,
          trackHeight: yOffset + GENERAL_SVG_CONFIG.BASE_ROW_HEIGHT,
          yOffset: i * GENERAL_SVG_CONFIG.BASE_ROW_HEIGHT + (i + 1) * GENERAL_SVG_CONFIG.PADDING + titleHeight + extraHeight,
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
        left: this.value.footerLeft || '',
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
    getEntryYOffset (index) {
      return GENERAL_SVG_CONFIG.ENTRY_SIZE * Math.floor(index / GENERAL_SVG_CONFIG.MAX_ENTRIES_PER_ROW);
    },
    getEntryXOffset (index) {
      const distanceIndex = index % GENERAL_SVG_CONFIG.MAX_ENTRIES_PER_ROW;
      return GENERAL_SVG_CONFIG.ENTRY_SIZE * distanceIndex;
    },
  },
};
</script>
