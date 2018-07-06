<template>
  <v-card class="description">
    <v-card-title class="white--text">
      <h3 class="title">{{ name }}</h3>
    </v-card-title>
    <v-card-text class="pt-0">
      <v-tabs v-model="activeTab" class="pb-2">
        <v-tab>Description</v-tab>
        <v-tab v-if="burst">JSON</v-tab>
        <v-tab v-if="burst">Buff List (Alpha)</v-tab>
      </v-tabs>
      <v-tabs-items v-model="activeTab" touchless>
        <v-tab-item>
          <v-layout row wrap>
            <v-flex xs12 :sm6="!!burst.associated_units" :md8="!!burst.associated_units">
              <v-layout row>
                <v-flex xs12>
                  <h3 class="subheading"><b>Description:</b></h3>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>{{ description }}</v-flex>
              </v-layout>
            </v-flex>
            <v-flex xs12 sm6 md4 v-if="!!burst.associated_units">
              <v-layout row>
                <v-flex xs12>
                  <h3 class="subheading"><b>Associated Unit ({{ (burstType || '').toUpperCase() }}):</b></h3>
                </v-flex>
              </v-layout>
              <v-layout row wrap>
                <v-flex
                  v-for="key in burst.associated_units"
                  :key="key"
                  xs12>
                  <unit-card :to="getMultidexPathTo(key)" v-if="unitById(key)" :unit="unitById(key)" class="mr-2 card--flat"/>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
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
        <v-tab-item v-if="burst">
          <v-container fluid>
            <v-layout row v-if="numLevels > 1">
              <v-flex xs4 md2 class="text-xs-center center-align-parent pa-0">
                <span style="width: 100%;" class="center-align-container">Level: {{ levelIndex + 1 }}</span>
              </v-flex>
              <v-flex xs8 md10 class="pa-0">
                <v-slider v-model="levelIndex" step="1" ticks min="0" :max="numLevels - 1"/>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <buff-list :effects="burst.levels[levelIndex].effects"/>
            </v-layout>
          </v-container>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import JsonViewer from '@/components/Multidex/JsonViewer';
import EffectList from '@/components/Multidex/EffectList/MainTable';
import UnitCard from '@/components/Multidex/Units/UnitCard';
import BuffList from '@/components/Multidex/BuffList/BuffList';

export default {
  props: ['burst', 'burstType'],
  components: {
    'json-viewer': JsonViewer,
    'effect-list': EffectList,
    'unit-card': UnitCard,
    'buff-list': BuffList,
  },
  computed: {
    ...mapGetters('units', ['unitById', 'getMultidexPathTo']),
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
