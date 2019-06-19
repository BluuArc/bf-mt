<template>
  <lazy-load-image
    :imageTitle="imageTitle"
    :displayWidth="displayWidth"
    :displayHeight="displayHeight"
    :imageWidth="imageDimensions[0]"
    :imageHeight="imageDimensions[1]"
    :placeholderSrc="placeHolderSrc"
    :src="(hasActualImage && src) || ''"
    :isVisible="isVisible"
  >
    <g slot="before-image">
      <slot name="before-image"/>
    </g>
    <g slot="after-image">
      <slot name="after-image"/>
    </g>
  </lazy-load-image>
</template>

<script>
import LazyLoadImageMixin from '@/components/LazyLoadImageMixin';
import { squadFillerMapping } from '@/modules/constants';
export default {
  mixins: [LazyLoadImageMixin],
  props: {
    src: {
      type: String,
      required: true,
    },
    imageTitle: {
      type: String,
      default: '',
    },
    rarity: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    placeHolderSrc () {
      if (this.rarity >= 5) {
        return require('@/assets/question_frame_4.png');
      } else if (this.rarity === 4) {
        return require('@/assets/question_frame_3.png');
      } else if (this.rarity === 3) {
        return require('@/assets/question_frame_2.png');
      } else {
        return require('@/assets/question_frame_1.png');
      }
    },
    imageDimensions: () => [102, 102],
    hasActualImage () {
      const getEndString = (id) => `${id}.png`;
      return ![squadFillerMapping.EMPTY, squadFillerMapping.ANY].some(id => this.src.endsWith(getEndString(id)));
    },
  },
};
</script>
