<template>
  <svg
    :width="displayWidth || imageWidth" :height="displayHeight || imageHeight"
    :viewBox="`0 0 ${imageWidth} ${imageHeight}`"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">
    <title v-if="imageTitle" v-text="imageTitle"/>
    <slot name="before-image"/>
    <g
      class="lazy--placeholder"
      :style="placeholderImageStyle"
      :imageWidth="imageWidth" :imageHeight="imageHeight">
      <slot name="placeholder">
        <image
          :width="imageWidth" :height="imageHeight"
          :xlink:href="placeholderSrc"
          :href="placeholderSrc"
          class="lazy--placeholder"
        />
      </slot>
    </g>
    <image
      :width="imageWidth" :height="imageHeight"
      :xlink:href="imageSource"
      :href="imageSource"
      class="lazy--actual"
      :style="actualImageStyle"
    />
    <slot name="after-image"/>
  </svg>
</template>

<script>
export default {
  props: {
    imageTitle: {
      type: String,
      default: '',
    },
    displayWidth: {
      type: Number,
      default: 0,
    },
    displayHeight: {
      type: Number,
      default: 0,
    },
    imageWidth: {
      type: Number,
      required: true,
    },
    imageHeight: {
      type: Number,
      required: true,
    },
    placeholderSrc: {
      type: String,
    },
    src: {
      type: String,
      required: true,
    },
    isVisible: {
      default: true,
    },
  },
  computed: {
    placeholderImageStyle () {
      return `display: ${this.imageLoaded ? 'none' : 'initial'}`;
    },
    actualImageStyle () {
      return `display: ${!this.imageLoaded ? 'none' : 'initial'}`;
    },
  },
  data () {
    return {
      imageLoaded: false,
      imageSource: '',
    };
  },
  mounted () {
    const imageElem = this.$el.querySelector('image.lazy--actual');
    imageElem.onload = () => {
      if (this.imageSource) {
        this.imageLoaded = true;
      }
    };

    // delay loading image if not visible
    if (this.isVisible) {
      this.imageSource = this.src;
    }
  },
  watch: {
    isVisible (newValue) {
      if (newValue && !this.imageSource) {
        const imageElem = this.$el.querySelector('image.lazy--actual');
        if (imageElem) {
          this.imageSource = this.src;
        }
      }
    },
  },
};
</script>
