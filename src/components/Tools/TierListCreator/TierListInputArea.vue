<template>
  <section class="tier-list-input-area">
    <section class="tier-list-svg-container">
      <tier-list-svg v-model="svgConfig" id="tier-list-svg"/>
    </section>
    <!-- <div class="text-xs-center" style="margin-top: -26px;">
      <v-btn fab small>
        <v-icon>keyboard_arrow_up</v-icon>
      </v-btn>
      <v-btn fab small>
        <v-icon>keyboard_arrow_down</v-icon>
      </v-btn>
    </div> -->
    <card-tabs-container
      v-model="currentTabIndex"
      :tabs="tabs"
      containerClass="pt-1 px-0"
    >
      <v-container fluid class="py-0 px-1" slot="general" grid-list-md>
        <v-layout align-baseline>
          <h3>Header Text</h3>
          <v-switch class="px-2 mt-0" hide-details v-model="showTitles"/>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12 sm4>
            <v-text-field
              label="Left Title"
              :disabled="!showTitles"
              v-model="titleLeft"
            />
          </v-flex>
          <v-flex xs12 sm4>
            <v-text-field
              label="Middle Title"
              :disabled="!showTitles"
              v-model="titleMiddle"
            />
          </v-flex>
          <v-flex xs12 sm4>
            <v-text-field
              label="Right Title"
              :disabled="!showTitles"
              v-model="titleRight"
            />
          </v-flex>
        </v-layout>
        <v-layout>
          <h3>Footer Text</h3>
        </v-layout>
        <v-flex>
          <v-text-field
            label="Left Footer"
            v-model="footerLeft"
          />
        </v-flex>
      </v-container>
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
import throttle from 'lodash/throttle';

export default {
  components: {
    TierListSvg,
    PromiseWait,
    CardTabsContainer,
  },
  computed: {
    tabs: () => Object.freeze(['General', 'Categories', 'Entries', 'Export'].map(name => ({ name, slot: name.toLowerCase() }))),
    titleKeys: () => Object.freeze(['titleLeft', 'titleMiddle', 'titleRight']),
  },
  data () {
    return {
      currentTabIndex: 0,
      svgConfig: {
        categories: getDefaultCategories(),
        entries: [
          [
            {
              name: 'Prophetic Tate & Tama',
              imgUrl: 'https://dv5bk1m8igv7v.cloudfront.net/asset/2220/content/unit/img/unit_ills_thum_10011.png',
              base64Url: null,
              // fontSize: '1em',
              // fontFamily: 'Arial',
              // textColor: colors.shades.white,
              // backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
            {
              name: 'Bond of Rih\'alnase',
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
        titleMiddle: 'My Tier List',
        footerLeft: `Created ${new Date().toDateString()}`,
      },
      transformedSvgConfigPromise: Promise.resolve({}),
      generateImageLinkPromise: Promise.resolve(),
      downloadLink: '',
      urlToBase64Mapping: new Map(),
      showTitles: true,
      titleLeft: '',
      titleMiddle: '',
      titleRight: '',
      footerLeft: '',
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
    updateKeyInSvgConfig (key, value) {
      this.svgConfig = {
        ...this.svgConfig,
        [key]: value,
      };
    },
    throttledUpdateKeyInSvgConfig: throttle(function(key, value) {
      this.updateKeyInSvgConfig(key, value);
    }, 500),
  },
  watch: {
    downloadLink (newValue, oldValue) {
      // clean up old object URL
      if (oldValue) {
        URL.revokeObjectURL(oldValue);
      }
    },
    footerLeft (newValue) {
      this.throttledUpdateKeyInSvgConfig('footerLeft', this.showTitles ? (newValue || ' ') : '');
    },
    titleLeft (newValue) {
      this.throttledUpdateKeyInSvgConfig('titleLeft', this.showTitles ? (newValue || ' ') : '');
    },
    titleMiddle (newValue) {
      this.throttledUpdateKeyInSvgConfig('titleMiddle', this.showTitles ? (newValue || ' ') : '');
    },
    titleRight (newValue) {
      this.throttledUpdateKeyInSvgConfig('titleRight', this.showTitles ? (newValue || ' ') : '');
    },
    showTitles (newValue) {
      this.titleKeys.forEach(titleKey => {
        this.updateKeyInSvgConfig(titleKey, newValue ? (this[titleKey] || ' ') : '');
      });
    },
    svgConfig: {
      immediate: true,
      handler (newValue) {
        if (newValue) {
          // sync with new config
          this.titleKeys.concat(['footerLeft']).forEach(svgConfigKey => {
            if (newValue[svgConfigKey] !== this[svgConfigKey]) {
              this[svgConfigKey] = newValue[svgConfigKey] || '';
            }
          });
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
