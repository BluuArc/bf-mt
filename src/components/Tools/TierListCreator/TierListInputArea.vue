<template>
  <section class="tier-list-input-area">
    <section class="tier-list-svg-container">
      <tier-list-svg v-model="svgConfig" id="tier-list-svg"/>
    </section>
    <card-tabs-container
      v-model="currentTabIndex"
      :tabs="tabs"
      containerClass="pt-1 px-0"
    >
      <section slot="general">
        General config here
      </section>
      <section slot="categories">
        Categories config here
      </section>
      <section slot="entries">
        Entries config here
      </section>
      <v-layout slot="export">
        <v-flex xs6>
          <v-btn
            @click="onGenerateButtonClick"
            block
            class="mr-2"
          >
            Generate Image
          </v-btn>
        </v-flex>
        <v-flex xs6>
          <promise-wait :promise="generateImageLinkPromise">
            <template slot="loading">
              <v-btn
                block
                class="ml-2"
                disabled
                loading
              />
            </template>
            <template>
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
            </template>
          </promise-wait>
        </v-flex>
      </v-layout>
    </card-tabs-container>
    <div style="display: none;">
      <promise-wait :promise="transformedSvgConfigPromise">
        <span slot="loading"/>
        <template slot-scope="{ result }">
          <tier-list-svg :value="result" id="tier-list-svg-transformed"/>
        </template>
      </promise-wait>
    </div>
  </section>
</template>

<script>
import { getDefaultCategories, fetchBase64Png } from '@/modules/core/tier-list-creator';
import PromiseWait from '@/components/PromiseWait';
import TierListSvg from './TierListMainSvg';
import CardTabsContainer from '@/components/CardTabsContainer';

export default {
  components: {
    TierListSvg,
    PromiseWait,
    CardTabsContainer,
  },
  computed: {
    tabs: () => Object.freeze(['General', 'Categories', 'Entries', 'Export'].map(name => ({ name, slot: name.toLowerCase() }))),
  },
  data () {
    return {
      currentTabIndex: 0,
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
      generateImageLinkPromise: Promise.resolve(),
      downloadLink: '',
      urlToBase64Mapping: new Map(),
    };
  },
  methods: {
    async generateDownloadLink () {
      // convert SVG to image
      const svg = this.$el.querySelector('svg#tier-list-svg-transformed');
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
    async waitUntilTrue (fn = () => true, maxAttempts = 100, timeoutLength = 1000) {
      let currentAttempt = 0;
      const delay = () => new Promise(fulfill => {
        setTimeout(() => fulfill(), timeoutLength);
      });

      let success = false;
      while (currentAttempt < maxAttempts && !(success = !!fn())) {
        currentAttempt++;
        await delay();
      }

      if (!success) {
        throw new Error(`Max failed attempts reached (${maxAttempts})`);
      }
    },
    onGenerateButtonClick () {
      this.generateImageLinkPromise = this.generateImageLink();
    },
    async generateImageLink () {
      this.transformedSvgConfigPromise = this.transformSvgConfig(this.svgConfig);

      await this.transformedSvgConfigPromise;
      // allow time for SVG to render
      await new Promise(fulfill => setTimeout(() => fulfill(), 100));
      await this.waitUntilTrue(() => !!this.$el.querySelector('svg#tier-list-svg-transformed'));
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
            urlMap.set(entry.imgUrl, base64Url);
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
    downloadLink (newValue, oldValue) {
      // clean up old object URL
      if (oldValue) {
        URL.revokeObjectURL(oldValue);
      }
    },
  },
};
</script>

<style lang="less">
.tier-list-input-area {
  display: flex;
  flex-direction: column;

  .v-tabs__bar {
    background-color: transparent;
  }
}

.tier-list-svg-container {
  overflow: auto;
  max-height: 60vh;
  svg {
    min-width: 768px;
  }
}
</style>
