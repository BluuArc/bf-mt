<template>
  <v-card>
    <v-card-title :class="`${titleColor} white--text`">
      <v-layout row wrap>
        <v-flex xs12 sm8 md9 class="text-xs-left">
          <h3 class="title">
            <span v-if="!burst">
              <b>{{ burstLabel }}:</b> {{ name }}
            </span>
            <template v-else>
              <router-link title="Click to view more details" :to="getMultidexPathTo(burst.id)" style="color: white">
                <span><b>{{ burstLabel }}:</b> {{ name }}</span>
              </router-link>
              <router-link title="Click to view more details" :to="getMultidexPathTo(burst.id)" style="color: white; text-decoration: none">
                <v-icon small class="pb-1 white--text">fas fa-external-link-alt</v-icon>
              </router-link>
            </template>
          </h3>
        </v-flex>
        <v-flex xs12 sm4 md3 class="text-xs-right">
          <v-tooltip bottom>
            <span slot="activator" style="border-bottom: 1px dotted;">
              {{ bcdcInfo.cost }} BC/{{ bcdcInfo.hits }} {{ bcdcInfo.hits === 1 ? 'Hit' : 'Hits' }}/{{ bcdcInfo.dropchecks }} DC
            </span>
            <span>
              BC required to fill {{ burstType.toUpperCase() }} gauge / Hits on {{ burstType.toUpperCase() }} / Total BC Dropchecks
            </span>
          </v-tooltip>
        </v-flex>
      </v-layout>
    </v-card-title>
    <v-card-text class="pt-0">
      <v-tabs v-model="activeTab" class="pb-2">
        <v-tab>Description</v-tab>
        <v-tab v-if="burst">Hitcounts</v-tab>
        <v-tab v-if="burst">JSON</v-tab>
      </v-tabs>
      <v-tabs-items v-model="activeTab" touchless>
        <v-tab-item :key="getLabelIndex('Description')">
          <span>{{ description }}</span>
          <template v-if="burst">
            <v-card-actions class="pl-0 pr-0 pt-2 pb-0">
              <v-btn flat class="ma-0" @click="showBuffList = !showBuffList">{{ showBuffList ? 'Hide' : 'Show' }} Buff List</v-btn>
            </v-card-actions>
            <v-slide-y-transition>
              <v-container fluid class="pl-0 pr-0" v-show="showBuffList">
                <v-layout row>
                  <v-divider/>
                </v-layout>
                <v-layout row v-if="numLevels > 1">
                  <v-flex xs4 md2 class="text-xs-center center-align-parent pa-0">
                    <span style="width: 100%;" class="center-align-container">Level: {{ levelIndex + 1 }}</span>
                  </v-flex>
                  <v-flex xs8 md10 class="pa-0">
                    <v-slider v-model="levelIndex" step="1" ticks min="0" :max="numLevels - 1"/>
                  </v-flex>
                </v-layout>
                <effect-list class="pt-0" :effects="burst.levels[levelIndex].effects"/>
              </v-container>
            </v-slide-y-transition>
          </template>
        </v-tab-item>
         <v-tab-item v-if="burst && hitCountData.length > 0" :key="getLabelIndex('Hitcounts')" style="max-height: 50vh; overflow-y: auto;">
           <v-expansion-panel :expand="$vuetify.breakpoint.smAndUp">
            <v-expansion-panel-content v-for="(d,i) in hitCountData" :key="i">
              <h3 slot="header" class="title pl-3 pr-3">Attack {{ i + 1 }} ({{ d.target }})</h3>
              <hit-count-table class="pl-3 pr-3" :attack="d.frames"/>
            </v-expansion-panel-content>
           </v-expansion-panel>
        </v-tab-item>
        <v-tab-item v-if="burst" :key="getLabelIndex('JSON')">
          <json-viewer :json="burst" :change-view="activeTab"/>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import JsonViewer from '@/components/Multidex/JsonViewer';
import EffectList from '@/components/Multidex/EffectList/MainTable';
import HitCountTable from '@/components/Multidex/Units/HitCountTable';

export default {
  props: ['burst', 'burstType'],
  components: {
    'json-viewer': JsonViewer,
    'effect-list': EffectList,
    'hit-count-table': HitCountTable,
  },
  computed: {
    ...mapGetters('bursts', ['getMultidexPathTo']),
    name () {
      return this.burst ? this.burst.name : 'None';
    },
    description () {
      return this.burst ? this.burst.desc : 'None';
    },
    tabLabels () {
      return this.burst ? ['Description', 'Hitcounts', 'JSON'] : ['Description'];
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
    attackingProcs: () => ['1', '13', '14', '27', '28', '29', '47', '61', '64', '75', '11000'].concat(['46', '48', '97']),
    bcdcInfo () {
      if (!this.burst) {
        return {};
      }

      const endLevel = this.burst.levels[this.numLevels - 1];

      const attacks = endLevel.effects
        .map((e, i) => ({
          'proc id': e['proc id'] || e['unknown proc id'],
          hits: e.hits || (this.burst['damage frames'][i] || {}).hits || 0,
        })).filter(e => this.attackingProcs.indexOf(e['proc id']) > -1);
      const numHits = attacks.reduce((acc, val) => (acc + +val.hits), 0);
      const dropChecks = numHits * +this.burst['drop check count'];

      return {
        cost: endLevel['bc cost'],
        hits: numHits,
        dropchecks: dropChecks,
      };
    },
    hitCountData () {
      const endLevel = this.burst.levels[this.numLevels - 1];
      return this.burst['damage frames']
        .map((f, i) => {
          const effectData = endLevel.effects[i];
          return {
            target: (effectData['random attack'] ? 'random' : effectData['target area']),
            id: (f['proc id'] || f['unknown proc id']).toString(),
            frames: f,
            effects: effectData,
          };
        }).filter(f => this.attackingProcs.includes(f.id));
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
