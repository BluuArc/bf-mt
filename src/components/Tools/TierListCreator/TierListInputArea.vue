<template>
  <section class="tier-list-input-area">
    <!-- <div>
      <v-text-field label="Title"/>
    </div> -->
    <div class="tier-list-svg-container">
      <promise-wait
        :promise="transformedSvgConfigPromise"
        loadingMessage="Loading image data..."
      >
        <template slot-scope="{ result }">
          <!-- TODO: replace with dual SVG configuration -->
          <tier-list-svg :value="result" @input="r => svgConfig = r" id="tier-list-svg"/>
        </template>
      </promise-wait>
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
import { getDefaultCategories, fetchBase64Png } from '@/modules/core/tier-list-creator';
import PromiseWait from '@/components/PromiseWait';
import TierListSvg from './TierListMainSvg';
export default {
  components: {
    TierListSvg,
    PromiseWait,
  },
  data () {
    return {
      svgConfig: {
        categories: getDefaultCategories(),
        entries: [
          [
            {
              name: 'Fencer Vargas',
              imgUrl: 'https://dv5bk1m8igv7v.cloudfront.net/asset/2220/content/unit/img/unit_ills_thum_10011.png',
              base64Url: null,
              // fontSize: '1em',
              // fontFamily: 'Arial',
              // textColor: colors.shades.white,
              // backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
            {
              name: 'Selena',
              imgUrl: 'https://dv5bk1m8igv7v.cloudfront.net/asset/2220/content/unit/img/unit_ills_thum_20011.png',
              base64Url: null,
            },
          ],
          [
            ...new Array(10).fill(0).map(() => ({
              name: 'Burny',
              imgUrl: 'https://dv5bk1m8igv7v.cloudfront.net/asset/2220/content/unit/img/unit_ills_thum_10032.png',
              base64Url: null,
            })),
          ],
          [
            ...new Array(15).fill(0).map(() => ({
              name: 'Squirty',
              imgUrl: 'https://dv5bk1m8igv7v.cloudfront.net/asset/2220/content/unit/img/unit_ills_thum_20032.png',
              base64Url: null,
            })),
          ],
        ],
      },
      transformedSvgConfigPromise: Promise.resolve({}),
      downloadLink: '',
      urlToBase64Mapping: new Map(),
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
      // canvas.remove();
      this.$el.appendChild(image);
      URL.revokeObjectURL(svgUrl);
      return pngUrl;
    },
    async generateImageLink () {
      this.downloadLink = await this.generateDownloadLink();
    },
    async transformSvgConfig (config = {}) {
      const initialEntries = Array.isArray(config.entries) ? config.entries : [];
      const transformedEntries = [];
      const urlMap = this.urlToBase64Mapping;
      for (const categoryEntries of initialEntries) {
        const newCategoryEntries = [];
        for (const entry of categoryEntries) {
          let base64Url = entry.base64Url || urlMap.get(entry.imgUrl);
          if (!base64Url && entry.imgUrl) {
            base64Url = await fetchBase64Png(entry.imgUrl);
            urlMap.set(entry.imgUrl);
          }
          newCategoryEntries.push({
            ...entry,
            base64Url,
          });
        }
        transformedEntries.push(newCategoryEntries);
      }
      return {
        ...config,
        entries: transformedEntries,
      };
    },
  },
  watch: {
    svgConfig: {
      immediate: true,
      handler (newValue) {
        if (newValue) {
          this.transformedSvgConfigPromise = this.transformSvgConfig(newValue);
        }
      },
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
  overflow: auto;
  max-height: 75vh;
  svg {
    min-width: 768px;
  }
}
</style>
