<template>
  <svg
    :width="displayWidth || imageWidth" :height="displayHeight || imageHeight"
    :viewBox="`0 0 ${imageWidth} ${imageHeight}`"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">
    <title v-if="imageTitle" v-text="imageTitle"/>
    <image
      v-if="useBackground"
      :href="require('@/assets/item_frame_bg2.png')"
      :width="imageWidth" :height="imageHeight"
      class="item-image-background"/>
    <lazy-load-image
      :imageTitle="imageTitle"
      :imageWidth="imageWidth"
      :imageHeight="imageHeight"
      :placeholderSrc="require('@/assets/secret.png')"
      :src="src"/>
    <image
      v-if="useFrame"
      :href="frameSrc"
      :width="imageWidth" :height="imageHeight"
      class="item-image-frame"/>
  </svg>
</template>

<script>
import LazyLoadImageMixin from '@/components/LazyLoadImageMixin';
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
    type: {
      type: String,
    },
    useFrame: {
      type: Boolean,
      default: true,
    },
    useBackground: {
      type: Boolean,
      default: true,
    },
    isRaidItem: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    frameSrc () {
      const type = this.type;
      const isRaidItem = this.isRaidItem;
      if (type === 'consumable' && !isRaidItem) {
        return require('@/assets/item_frame_1.png');
      } else if (type === 'material' && !isRaidItem) {
        return require('@/assets/item_frame_2.png');
      } else if (type === 'sphere') {
        return require('@/assets/item_frame_3.png');
      } else if (type === 'evomat') {
        return require('@/assets/item_frame_4.png');
      } else if (type === 'summoner_consumable') {
        return require('@/assets/item_frame_6.png');
      } else if (isRaidItem) {
        return require('@/assets/item_frame_5.png');
      } else if (type === 'ls_sphere') {
        return require('@/assets/item_frame_7.png');
      } else {
        return require('@/assets/item_frame_0.png');
      }
    },
    imageDimensions: () => [102, 102],
    imageWidth () {
      return this.imageDimensions[0];
    },
    imageHeight () {
      return this.imageDimensions[1];
    },
  },
};
</script>
