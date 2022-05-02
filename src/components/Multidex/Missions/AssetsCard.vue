<template>
  <description-card-base
    :entry="mission"
    materialColor="blue-grey"
    :titleHtmlGenerator="() => 'Assets Info'"
    :treeOptions="{ maxDepth: 1 }"
    :effectGetter="() => []"
    :tabNames="availableTabs">
    <template slot="none">
      No assets found for this dungeon.
    </template>
    <template slot="background">
      {{ mission.assets.background }} (<a :href="getBackgroundUrl(mission.assets.background)">Direct Link</a>)<br/>

      <img
        :src="getBackgroundUrl(mission.assets.background)"
        style="width: 100%"
        :alt="backgroundAltText"
      />
    </template>
    <template slot="audio">
      <template v-if="mission.assets.battleMusic">
        <figure>
          <figcaption>Listen to the battle music ({{mission.assets.battleMusic}} - <a :href="getAudioUrl(mission.assets.battleMusic)">Direct Link</a>):</figcaption>
          <audio
              controls
              style="width: 100%"
              :src="getAudioUrl(mission.assets.battleMusic)"
            >
              Your browser does not support the <code>audio</code> element.
          </audio>
        </figure>
      </template>
      <template v-if="mission.assets.bossMusic">
        <figure>
          <figcaption>Listen to the boss music ({{mission.assets.bossMusic}} - <a :href="getAudioUrl(mission.assets.bossMusic)">Direct Link</a>):</figcaption>
          <audio
              controls
              style="width: 100%"
              :src="getAudioUrl(mission.assets.bossMusic)"
            >
              Your browser does not support the <code>audio</code> element.
          </audio>
        </figure>
      </template>
    </template>
    <template slot="intro-cutscene">
      {{ mission.assets.openingCutscene }} (<a :href="getCommonCutsceneUrl(mission.assets.openingCutscene)">Direct Link</a>)<br/>
      <text-viewer
        :inputText="openingCutsceneText"
        :value="openingCutsceneText"
      />
    </template>
    <template slot="end-cutscene">
      {{ mission.assets.endingCutscene }} (<a :href="getCommonCutsceneUrl(mission.assets.endingCutscene)">Direct Link</a>)<br/>
      <text-viewer
        :inputText="endingCutsceneText"
        :value="endingCutsceneText"
      />
    </template>
  </description-card-base>
</template>

<script>
import { mapGetters } from 'vuex';
import { getText } from '@/modules/download-helper';
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import TextViewer from '@/components/TextViewer';

export default {
  props: {
    mission: {
      type: Object,
    },
    logger: {
      required: true,
    },
  },
  components: {
    DescriptionCardBase,
    TextViewer,
  },
  computed: {
    ...mapGetters('missions', [
      'getBackgroundUrl',
      'getAudioUrl',
      'getCommonCutsceneUrl',
    ]),
    hasAssets () {
      return !!(this.mission && this.mission.assets);
    },
    availableTabs () {
      if (!this.hasAssets) {
        return ['None'];
      }

      const assetsEntry = this.mission.assets;
      return [
        assetsEntry.background && 'Background',
        (assetsEntry.battleMusic || assetsEntry.bossMusic) && 'Audio',
        assetsEntry.openingCutscene && 'Intro Cutscene',
        assetsEntry.endingCutscene && 'End Cutscene',
      ].filter(v => v);
    },
    backgroundAltText () {
      return `Background image used in the quest "${this.mission.name}"`;
    },
  },
  data: () => ({
    openingCutsceneText: 'Loading...',
    endingCutsceneText: 'Loading...',
  }),
  watch: {
    mission: {
      immediate: true,
      async handler (newValue) {
        if (newValue && newValue.assets) {
          const loadPromises = [];
          const assetsEntry = newValue.assets;
          const BASE_URL = 'https://macabre-broomstick-39921.herokuapp.com/get';
          const getCustsceneUrl = (fileName) => {
            const pathOnServer = this.getCommonCutsceneUrl(fileName);
            return `${BASE_URL}/${encodeURIComponent(pathOnServer)}`;
          };
          if (assetsEntry.openingCutscene) {
            this.openingCutsceneText = `Loading ${assetsEntry.openingCutscene}...`;
            loadPromises.push(getText(getCustsceneUrl(assetsEntry.openingCutscene))
              .then((text) => {
                this.openingCutsceneText = text;
              }).catch((err) => {
                this.logger.error(`Error occurred fetching ${assetsEntry.openingCutscene}`, { err });
                this.openingCutsceneText = `Error occurred fetching ${assetsEntry.openingCutscene}`;
              }));
          }

          if (assetsEntry.endingCutscene) {
            this.endingCutsceneText = `Loading ${assetsEntry.endingCutscene}...`;
            loadPromises.push(getText(getCustsceneUrl(assetsEntry.endingCutscene))
              .then((text) => {
                this.endingCutsceneText = text;
              }).catch((err) => {
                this.logger.error(`Error occurred fetching ${assetsEntry.endingCutscene}`, { err });
                this.endingCutsceneText = `Error occurred fetching ${assetsEntry.endingCutscene}`;
              }));
          }

          if (loadPromises.length > 0) {
            await loadPromises;
          }
        }
      },
    },
  },
};
</script>
