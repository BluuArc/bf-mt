<template>
  <section class="tier-list-input-area">
    <!-- <div>
      <v-text-field label="Title"/>
    </div> -->
    <div class="tier-list-svg-container">
      <tier-list-svg v-model="svgConfig" id="tier-list-svg"/>
    </div>
    <v-layout>
      <v-btn
        @click="generateImageLink"
        block
        class="mr-2"
      >
        Generate Image
      </v-btn>
      <v-btn
        block
        class="ml-2"
        :color="(downloadLink && 'primary') || undefined"
        :disabled="!downloadLink"
        :href="downloadLink"
        target="_blank"
      >
        Download Image
      </v-btn>
    </v-layout>
  </section>
</template>

<script>
import TierListSvg from './TierListMainSvg';
export default {
  components: {
    TierListSvg,
  },
  data () {
    return {
      svgConfig: {},
      downloadLink: '',
    };
  },
  methods: {
    async generateDownloadLink () {
      // convert SVG to image
      const svg = this.$el.querySelector('svg#tier-list-svg');
      const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(blob);
      const image = await new Promise((fulfill, reject) => {
        const tempImage = new Image();
        tempImage.addEventListener('load', () => fulfill(tempImage), { once: true });
        tempImage.addEventListener('error', (e) => reject(e), { once: true });
        tempImage.src = svgUrl;
      });

      // apply image to a canvas
      // eslint-disable-next-line no-unused-vars
      const [x, y, width, height] = svg.getAttribute('viewBox').split(' ');
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(image, 0, 0);

      // convert canvas to PNG URL and clean up
      const pngUrl = await new Promise((fulfill) => {
        canvas.toBlob((blob) => fulfill(URL.createObjectURL(blob)), 'image/png');
      });
      image.remove();
      canvas.remove();
      URL.revokeObjectURL(svgUrl);
      return pngUrl;
    },
    async generateImageLink () {
      this.downloadLink = await this.generateDownloadLink();
    },
  },
};
</script>

<style lang="less">
.tier-list-input-area {
  display: flex;
  flex-direction: column;
}

.tier-list-svg-container {
  overflow-x: auto;
  svg {
    min-width: 768px;
  }
}
</style>
