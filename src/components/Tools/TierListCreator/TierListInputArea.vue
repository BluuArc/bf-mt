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
          <v-text-field
            v-model="importCode"
            label="Import Code"
            persistent-hint
            hint="Apply an empty code to reset the tier list"
          />
          <v-btn :flat="!importCode" @click="applyImportCode">
            Import
          </v-btn>
        </v-layout>
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
      <section slot="links">
        <multidex-links :entries="svgConfig.entries"/>
      </section>
      <section slot="entries">
        <v-layout wrap align-baseline class="px-2">
          <v-flex xs12 md3>
            <label :class="{
              'v-label': true,
              'theme--dark': !$store.state.settings.lightMode,
              'theme--light': $store.state.settings.lightMode
            }">Image Type</label>
          </v-flex>
          <v-flex
            v-for="type in IMAGE_TYPES"
            :key="type.key"
            md3 xs12
          >
            <v-btn
              :outline="activeImageType === type.key"
              flat block
              @click="activeImageType = type.key"
            >
              {{ type.name }}
            </v-btn>
          </v-flex>
        </v-layout>
        <v-layout class="px-2">
          <v-slider
            v-model="maxEntriesPerRow"
            label="Max Entries per Row"
            thumb-label="always"
            thumb-size="24"
            hide-details
            min="3" max="20"
            @change="updateMaxEntries"
          />
        </v-layout>
        <category-config v-model="svgConfig"/>
      </section>
      <v-layout slot="export" column>
        <v-layout>
          <v-text-field
            :key="shareableConfigCode"
            label="Scale Factor"
            :value="scaleFactor"
            @change="$v => scaleFactor = +$v > 0 ? +$v : 1"
            :hint="getEstimatedDimensionsText()"
            persistent-hint
          />
        </v-layout>
        <v-layout>
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
              <template slot-scope="{ result }">
                <v-btn
                  block
                  class="ml-2"
                  :color="(result.downloadLink && 'primary') || undefined"
                  :disabled="!result.downloadLink"
                  :href="result.downloadLink"
                  target="_blank"
                >
                  Download Image
                </v-btn>
              </template>
            </promise-wait>
          </v-flex>
        </v-layout>
        <v-flex>
          <one-line-text-viewer
            :inputText="shareableConfigCode"
            label="Code"
            :value="shareableConfigCode"
          />
        </v-flex>
      </v-layout>
    </card-tabs-container>
    <div v-show="showGeneratedSvg" style="position: absolute; left: -100%; top: -100%;">
      <promise-wait :promise="transformedSvgConfigPromise">
        <span slot="loading"/>
        <template slot-scope="{ result }">
          <tier-list-svg :value="result" id="tier-list-svg-transformed"/>
        </template>
      </promise-wait>
    </div>
    <v-dialog
      v-model="showGeneratingDialog"
      persistent
      width="300"
    >
      <v-card>
        <v-container justify-center align-center>
          <v-layout>
            Generating Output Image
          </v-layout>
          <v-layout>
            <v-progress-linear indeterminate/>
          </v-layout>
        </v-container>
      </v-card>
    </v-dialog>
  </section>
</template>

<script>
import { fetchBase64Png, generateTierListCode, getDefaultCategories, parseTierListCode } from '@/modules/core/tier-list-creator';
import { getUnitImageUrls } from '@/modules/core/units';
import PromiseWait from '@/components/PromiseWait';
import CardTabsContainer from '@/components/CardTabsContainer';
import OneLineTextViewer from '@/components/OneLineTextViewer';
import TierListSvg from './TierListMainSvg';
import CategoryConfig from './CategoryConfig';
import MultidexLinks from './MultidexLinks';
import throttle from 'lodash/throttle';

const IMAGE_TYPES = [
  { name: 'Elemental Thumbnail', key: 'ills_thum' },
  { name: 'Battle Thumbnail', key: 'ills_battle' },
  { name: 'Full Illustration', key: 'ills_full' },
  // TODO: support idle sprites
];

export default {
  props: {
    inputCategories: {
      type: Array,
      default: () => [],
    },
    inputEntries: {
      type: Array,
      default: () => [],
    },
    inputConfig: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    PromiseWait,
    CardTabsContainer,
    TierListSvg,
    CategoryConfig,
    OneLineTextViewer,
    MultidexLinks,
  },
  computed: {
    tabs: () => Object.freeze(['General', 'Entries', 'Export', 'Links'].map(name => ({ name, slot: name.toLowerCase() }))),
    titleKeys: () => Object.freeze(['titleLeft', 'titleMiddle', 'titleRight']),
    currentConfigCode () {
      const { categories, entries, ...config } = this.svgConfig;
      return generateTierListCode(categories, entries, config);
    },
    shareableConfigCode () {
      return encodeURIComponent(this.currentConfigCode);
    },
    hasEntriesWithoutUrl () {
      return this.svgConfig.entries.some(categoryEntries => {
        return categoryEntries.some(entry => !entry.imgUrl);
      });
    },
    defaultCode () {
      return generateTierListCode(getDefaultCategories());
    },
    IMAGE_TYPES: () => IMAGE_TYPES,
  },
  data () {
    return {
      currentTabIndex: 0,
      svgConfig: {
        categories: [],
        entries: [],
        titleMiddle: 'My Tier List',
        footerLeft: `Created ${new Date().toDateString()}`,
      },
      transformedSvgConfigPromise: Promise.resolve({}),
      generateImageLinkPromise: Promise.resolve(''),
      downloadLink: '',
      urlToBase64Mapping: new Map(),
      showTitles: true,
      titleLeft: '',
      titleMiddle: '',
      titleRight: '',
      footerLeft: '',
      showGeneratedSvg: false,
      showGeneratingDialog: false,
      importCode: '',
      activeImageType: 'ills_thum',
      maxEntriesPerRow: 8,
      scaleFactor: 1,
    };
  },
  methods: {
    getEstimatedDimensionsText () {
      const svg = this.$el && this.$el.querySelector('svg#tier-list-svg');
      if (svg) {
        const { scaleFactor } = this; // eslint-disable-line no-unused-vars
        const [x, y, width, height] = svg.getAttribute('viewBox').split(' '); // eslint-disable-line no-unused-vars
        const newWidth = width * scaleFactor;
        const newHeight = height * scaleFactor;
        return `Estimated Dimensions: ${newWidth} x ${newHeight}`;
      } else {
        return '';
      }
    },
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
      const [x, y, width, height] = svg.getAttribute('viewBox').split(' '); // eslint-disable-line no-unused-vars
      const canvas = document.createElement('canvas');
      canvas.width = width * this.scaleFactor;
      canvas.height = height * this.scaleFactor;
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);

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

      this.showGeneratedSvg = true;
      this.showGeneratingDialog = true;
      await this.transformedSvgConfigPromise;
      // allow time for SVG to render
      await new Promise(fulfill => setTimeout(() => fulfill(), 1000));
      await this.waitUntilTrue(() => !!this.$el.querySelector('svg#tier-list-svg-transformed'));
      this.downloadLink = await this.generateDownloadLink();
      this.showGeneratedSvg = false;
      this.showGeneratingDialog = false;
      return {
        downloadLink: this.downloadLink,
      };
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
    getExpandedInputEntries (entries = []) {
      // TODO: support other types besides unit
      const getUnit = this.$store.getters['units/getById'];
      return entries.map(categoryEntries => {
        return categoryEntries.map(entry => {
          const urls = getUnitImageUrls({
            id: entry.id,
            server: this.$store.state.settings.activeServer,
            suffix: entry.altArtId ? `_${entry.altArtId}` : '',
          });

          return {
            ...entry,
            imgUrl: urls[this.activeImageType] || urls.ills_thum,
            name: (getUnit(entry.id) || {}).name || entry.id,
          };
        });
      });
    },
    applyImportCode () {
      const { categories, entries, config } = parseTierListCode(this.importCode || this.defaultCode, true);
      this.svgConfig = {
        ...this.svgConfig,
        ...config,
        categories,
        entries,
      };
      this.importCode = '';
    },
    ensureOverflowIsOff () {
      if (this.$store.state.disableHtmlOverflow) {
        this.$store.commit('setHtmlOverflowDisableState', false);
      }
    },
    updateMaxEntries () {
      this.updateKeyInSvgConfig('maxEntriesPerRow', this.maxEntriesPerRow);
    },
  },
  watch: {
    currentTabIndex: {
      immediate: true,
      handler () {
        this.ensureOverflowIsOff();
      },
    },
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
    inputCategories (newVal) {
      this.updateKeyInSvgConfig('categories', newVal);
    },
    inputEntries (newVal) {
      this.updateKeyInSvgConfig('entries', this.getExpandedInputEntries(newVal));
    },
    inputConfig (newVal) {
      this.svgConfig = {
        ...this.svgConfig,
        ...newVal,
      };

      if (!isNaN(newVal.maxEntriesPerRow) && +newVal.maxEntriesPerRow !== this.maxEntriesPerRow) {
        this.maxEntriesPerRow = +newVal.maxEntriesPerRow;
      }

      if (!isNaN(newVal.scaleFactor) && +newVal.scaleFactor !== this.scaleFactor) {
        this.scaleFactor = +newVal.scaleFactor;
      }
    },
    activeImageType () {
      this.updateKeyInSvgConfig('entries', this.getExpandedInputEntries(this.svgConfig.entries));
    },
    currentConfigCode (newVal) {
      if (newVal !== this.$route.query.code) {
        this.$router.replace({
          path: this.$route.path,
          query: {
            ...this.$route.query,
            code: newVal,
          },
        });
      }
    },
    hasEntriesWithoutUrl (newValue) {
      if (newValue) {
        this.updateKeyInSvgConfig('entries', this.getExpandedInputEntries(this.svgConfig.entries));
      }
    },
    scaleFactor (newVal) {
      this.updateKeyInSvgConfig('scaleFactor', newVal);
    },
  },
  mounted () {
    this.svgConfig = {
      ...this.svgConfig,
      ...this.inputConfig,
      categories: this.inputCategories,
      entries: this.getExpandedInputEntries(this.inputEntries),
    };
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
