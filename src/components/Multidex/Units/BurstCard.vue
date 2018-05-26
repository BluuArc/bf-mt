<template>
  <v-card>
    <v-card-title :class="`${titleColor} white--text`">
      <h3 class="title"><b>{{ burstLabel }}:</b> {{ name }}</h3>
    </v-card-title>
    <v-card-text class="pt-0">
      <v-tabs v-model="activeTab" class="pb-2">
        <v-tab>Description</v-tab>
        <v-tab v-if="burst">JSON</v-tab>
      </v-tabs>
      <v-tabs-items v-model="activeTab">
        <v-tab-item :key="getLabelIndex('Description')">
          <span>{{ description }}</span>
          <template v-if="burst">
            <v-card-actions class="pl-0 pr-0 pt-2 pb-0">
              <v-btn flat class="ma-0" @click="showBuffList = !showBuffList">{{ showBuffList ? 'Hide' : 'Show' }} Buff List</v-btn>
            </v-card-actions>
            <v-slide-y-transition>
              <v-container fluid v-show="showBuffList">
                <v-layout row v-if="numLevels > 1">
                  <v-flex xs4 md2 class="text-xs-center vertical-align-parent pa-0">
                    <span class="vertical-align-container">Level: {{ levelIndex + 1 }}</span>
                  </v-flex>
                  <v-flex xs8 md10 cass="pa-0">
                    <v-slider v-model="levelIndex" step="1" ticks min="0" :max="numLevels - 1"/>
                  </v-flex>
                </v-layout>
                <proc-buff-list class="pt-0" :effects="burst.levels[levelIndex].effects"/>  
              </v-container>
            </v-slide-y-transition>
          </template>
        </v-tab-item>
        <v-tab-item v-if="burst" :key="getLabelIndex('JSON')">
          <json-viewer :json="burst"/>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import JsonViewer from '@/components/Multidex/JsonViewer';
import ProcBuffList from '@/components/Multidex/ProcBuffList';

export default {
  props: ['burst', 'burstType'],
  components: {
    'json-viewer': JsonViewer,
    'proc-buff-list': ProcBuffList,
  },
  computed: {
    name () {
      return this.burst ? this.burst.name : 'None';
    },
    description () {
      return this.burst ? this.burst.desc : 'None';
    },
    tabLabels () {
      return this.burst ? ['Description', 'JSON'] : ['Description'];
    },
    burstLabel () {
      const types = {
        bb: 'Brave Burst',
        sbb: 'Super Brave Burst',
        ubb: 'Ultimate Brave Burst',
      };
      return types[this.burstType];
    },
    titleColor () {
      const types = {
        bb: 'blue-grey',
        sbb: 'yellow darken-3',
        ubb: 'red darken-3',
      };
      return types[this.burstType];
    },
    numLevels () {
      return this.burst ? this.burst.levels.length : 0;
    },
  },
  watch: {
    numLevels (newValue) {
      this.levelIndex = (newValue === 0) ? 0 : (newValue - 1);
    },
  },
  data () {
    return {
      activeTab: 0,
      showBuffList: false,
      levelIndex: 0,
    };
  },
  mounted () {
    this.levelIndex = (this.numLevels === 0) ? 0 : (this.numLevels - 1);
  },
  methods: {
    getLabelIndex (label) {
      return this.tabLabels.indexOf(label);
    },
  },
};
</script>
