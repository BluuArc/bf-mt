<template>
  <v-card class="description">
    <v-card-title class="white--text">
      <h3 class="title">{{ burst.name }}</h3>
    </v-card-title>
    <v-card-text class="pt-0">
      <v-tabs v-model="activeTab" class="pb-2">
        <v-tab>Description</v-tab>
        <v-tab v-if="burst">JSON</v-tab>
      </v-tabs>
      <v-tabs-items v-model="activeTab" touchless>
        <v-tab-item>
          <span>{{ description }}</span>
          <template v-if="burst">
            <v-card-actions class="pl-0 pr-0 pt-2 pb-0">
              <v-btn flat class="ma-0" @click="showEffectList = !showEffectList">{{ showEffectList ? 'Hide' : 'Show' }} Buff List</v-btn>
            </v-card-actions>
            <v-slide-y-transition>
              <v-container fluid class="pl-0 pr-0" v-show="showEffectList">
                <v-layout row>
                  <v-divider/>
                </v-layout>
                <v-layout row v-if="numLevels > 1">
                  <v-flex xs4 md2 class="text-xs-center center-align-parent pt-0 pb-0">
                    <span style="width: 100%;" class="center-align-container">Level: {{ levelIndex + 1 }}</span>
                  </v-flex>
                  <v-flex xs8 md10 class="pt-0 pb-0">
                    <v-slider v-model="levelIndex" step="1" ticks min="0" :max="numLevels - 1"/>
                  </v-flex>
                </v-layout>
                <effect-list class="pt-0" :effects="burst.levels[levelIndex].effects"/>  
              </v-container>
            </v-slide-y-transition>
          </template>
        </v-tab-item>
        <v-tab-item v-if="burst">
          <json-viewer :json="burst" :change-view="activeTab"/>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import JsonViewer from '@/components/Multidex/JsonViewer';
import EffectList from '@/components/Multidex/EffectList/MainTable';

export default {
  props: ['burst'],
  components: {
    'json-viewer': JsonViewer,
    'effect-list': EffectList,
  },
  computed: {
    name () {
      return this.burst ? this.burst.name : 'None';
    },
    description () {
      const emptyDescriptions = ['None', '0'];
      if (this.burst && this.burst.desc && !emptyDescriptions.includes(this.burst.desc)) {
        return this.burst.desc;
      }
      return 'No description.';
    },
    tabLabels () {
      return this.burst ? ['Description', 'JSON'] : ['Description'];
    },
    numLevels () {
      return this.burst ? this.burst.levels.length : 0;
    },
  },
  watch: {
    numLevels () {
      this.resetLevelIndex();
    },
  },
  data () {
    return {
      activeTab: 0,
      showEffectList: false,
      levelIndex: 0,
    };
  },
  created () {
    this.resetLevelIndex();
  },
  methods: {
    resetLevelIndex () {
      this.levelIndex = (this.numLevels === 0) ? 0 : (this.numLevels - 1);
    },
  },
};
</script>
