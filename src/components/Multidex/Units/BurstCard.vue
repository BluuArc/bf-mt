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
        <v-tab v-if="burst">Buff List (Alpha)</v-tab>
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
              <div slot="header" class="pl-3 pr-3">
                <h3 :class="`title ${$vuetify.breakpoint.xsOnly ? '' : 'd-inline'}`">Attack {{ i + 1 }}</h3>
                <v-chip small>{{ d.target }}</v-chip>
                <v-chip small>{{ d.delay }} delay</v-chip>
                <v-chip v-if="hasSelfSpark(d.frames, d.delay)" small>{{ getSelfSparkCount(d.frames, d.delay) }} Self Sparks</v-chip>
                <v-chip small>{{ getTotalDistribution(d.frames)}}% DMG Distribution</v-chip>
              </div>
              <hit-count-table class="pl-3 pr-3" :attack="d.frames" :sparked-frames="sparkedFrames" :attack-index="i" attack-type="native" :delay="+(d.delay.split('/')[1])"/>
            </v-expansion-panel-content>
            <v-expansion-panel-content v-for="(d,j) in extraAttackHitCountData" :key="hitCountData.length + j">
              <div slot="header" class="pl-3 pr-3">
                <h3 :class="`title ${$vuetify.breakpoint.xsOnly ? '' : 'd-inline'}`">Attack {{ hitCountData.length + j + 1 }} - ({{ d.source }})</h3>
                <v-chip small>{{ d.target }}</v-chip>
                <v-chip small>{{ d.delay }} delay</v-chip>
                <v-chip v-if="hasSelfSpark(d.frames, d.delay)" small>{{ getSelfSparkCount(d.frames, d.delay) }} Self Sparks</v-chip>
                <v-chip small>{{ getTotalDistribution(d.frames)}}% DMG Distribution</v-chip>
              </div>
              <hit-count-table class="pl-3 pr-3" :attack="d.frames" :sparked-frames="sparkedFrames" :attack-index="j" attack-type="extra" :delay="+(d.delay.split('/')[1])"/>
            </v-expansion-panel-content>
           </v-expansion-panel>
        </v-tab-item>
        <v-tab-item v-if="burst" :key="getLabelIndex('JSON')">
          <json-viewer :json="burst" :change-view="activeTab"/>
        </v-tab-item>
        <v-tab-item v-if="burst" :key="getLabelIndex('Buff List')">
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
import { mapGetters, mapState } from 'vuex';
import { knownConstants } from '@/store/modules/db.common';
import JsonViewer from '@/components/Multidex/JsonViewer';
import EffectList from '@/components/Multidex/EffectList/MainTable';
import HitCountTable from '@/components/Multidex/Units/HitCountTable';
import BuffList from '@/components/Multidex/BuffList/BuffList';
import SWorker from '@/assets/sww.min.js';

export default {
  props: ['burst', 'burstType', 'extraAttacks', 'unit'],
  components: {
    'json-viewer': JsonViewer,
    'effect-list': EffectList,
    'hit-count-table': HitCountTable,
    'buff-list': BuffList,
  },
  computed: {
    ...mapGetters('bursts', ['getMultidexPathTo']),
    ...mapState('units', ['activeServer']),
    name () {
      return this.burst ? this.burst.name : 'None';
    },
    description () {
      return this.burst ? this.burst.desc : 'None';
    },
    tabLabels () {
      return this.burst ? ['Description', 'Hitcounts', 'JSON', 'Buff List'] : ['Description'];
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
    attackingProcs: () => knownConstants.attackingProcs,
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
      if (!this.burst) {
        return [];
      }
      const endLevel = this.burst.levels[this.numLevels - 1];
      return this.burst['damage frames']
        .map((f, i) => {
          const effectData = endLevel.effects[i];
          return {
            target: knownConstants.targetAreaMapping[effectData['random attack'] ? 'random' : effectData['target area']],
            id: (f['proc id'] || f['unknown proc id']).toString(),
            frames: f,
            delay: effectData['effect delay time(ms)/frame'],
            effects: effectData,
          };
        }).filter(f => this.attackingProcs.includes(f.id));
    },
    healFrameData () {
      if (!this.burst) {
        return [];
      }
      const endLevel = this.burst.levels[this.numLevels - 1];
      return this.burst['damage frames']
        .map((f, i) => {
          const effectData = endLevel.effects[i];
          return {
            target: knownConstants.targetAreaMapping[effectData['random attack'] ? 'random' : effectData['target area']],
            id: (f['proc id'] || f['unknown proc id']).toString(),
            frames: f,
            delay: effectData['effect delay time(ms)/frame'],
            effects: effectData,
          };
        }).filter(f => f.id === '2');
    },
    extraAttackFrames () {
      const frames = {
        'frame times': [],
        'hit dmg% distribution': [],
      };

      // gather frame data
      this.hitCountData.map(d => d.frames).forEach((frameSet, i) => {
        frames['frame times'] = frames['frame times'].concat(frameSet['frame times'].slice(i === 0 ? 0 : 1));
        frames['hit dmg% distribution'] = frames['hit dmg% distribution'].concat(frameSet['hit dmg% distribution'].slice(i === 0 ? 0 : 1));
      });

      this.healFrameData.map(d => d.frames).forEach((frameSet, i) => {
        frames['frame times'] = frames['frame times'].concat(frameSet['frame times'].slice(i === 0 && this.hitCountData.length === 0 ? 0 : 1));
        frames['hit dmg% distribution'] = frames['hit dmg% distribution'].concat(frameSet['hit dmg% distribution'].slice(i === 0 && this.hitCountData.length === 0 ? 0 : 1));
      });

      // sort frames by frame time
      const unifiedFrames = [];
      frames['frame times'].forEach((time, i) => {
        unifiedFrames.push({ time, dmg: frames['hit dmg% distribution'][i] });
      });
      frames['frame times'] = [];
      frames['hit dmg% distribution'] = [];
      unifiedFrames.sort((a, b) => a.time - b.time).forEach(({ time, dmg }) => {
        frames['frame times'].push(time);
        frames['hit dmg% distribution'].push(dmg);
      });

      return frames;
    },
    extraAttackHitCountData () {
      if (!this.burst) {
        return [];
      }
      const attacks = this.extraAttacks.slice();
      if (this.activeServer === 'gl' && this.burstType !== 'ubb') {
        attacks.push({
          'target area': 'single',
          'proc id': '1',
          'effect delay time(ms)/frame': '0.0/0',
          source: 'Wiles Sphere',
        });
      }
      return attacks.map((effectData, i) => {
        return {
          target: knownConstants.targetAreaMapping[effectData['random attack'] ? 'random' : effectData['target area']],
          id: (effectData['proc id'] || effectData['unknown proc id']).toString(),
          frames: this.extraAttackFrames,
          effects: effectData,
          delay: effectData['effect delay time(ms)/frame'],
          source: effectData.source,
        };
      });
    },
  },
  watch: {
    numLevels (newValue) {
      this.levelIndex = (newValue === 0) ? 0 : (newValue - 1);
    },
    async extraAttackHitCountData () {
      try {
        await this.calculateSparkedFrames();
      } catch (err) {
        console.error('error calculating sparked frames', err);
      }
    },
    async hitCountData () {
      try {
        await this.calculateSparkedFrames();
      } catch (err) {
        console.error('error calculating sparked frames', err);
      }
    },
  },
  data () {
    return {
      activeTab: 0,
      showBuffList: false,
      levelIndex: 0,
      sparkedFrames: null,
    };
  },
  async mounted () {
    this.levelIndex = (this.numLevels === 0) ? 0 : (this.numLevels - 1);
    try {
      await this.calculateSparkedFrames();
    } catch (err) {
      console.error('error calculating sparked frames', err);
    }
  },
  methods: {
    getLabelIndex (label) {
      return this.tabLabels.indexOf(label);
    },
    getTotalDistribution (frames) {
      return frames['hit dmg% distribution'].reduce((acc, val) => acc + val, 0);
    },
    async calculateSparkedFrames () {
      this.sparkedFrames = null;
      const result = await SWorker.run((native, extra) => {
        const allFrames = {};
        const addFrame = (time, index, type) => {
          const timeKey = time.toString();
          if (!allFrames[timeKey]) {
            allFrames[timeKey] = [];
          }
          allFrames[timeKey].push({ index, type });
        };
        native.forEach((entry, index) => {
          const delay = +(entry.delay.split('/')[1]);
          const frames = entry.frames['frame times'];
          // console.debug('native', index, delay);
          frames.forEach(time => {
            addFrame(+time + delay, index, 'native');
          });
        });
        extra.forEach((entry, index) => {
          const delay = +(entry.delay.split('/')[1]);
          const frames = entry.frames['frame times'];
          // console.debug('extra', index, delay);
          frames.forEach(time => {
            addFrame(+time + delay, index, 'extra');
          });
        });
        const sparkedFrames = {};
        for (const time in allFrames) {
          const entry = allFrames[time];
          if (entry.length > 1) {
            sparkedFrames[time] = entry.slice();
          }
        }
        return sparkedFrames;
      }, [this.hitCountData, this.extraAttackHitCountData]);
      this.sparkedFrames = result;
    },
    hasSelfSpark (frames, inputDelay) {
      const delay = +(inputDelay.split('/')[1]);
      return this.sparkedFrames && frames['frame times'].some((time) => !!this.sparkedFrames[(+time + delay).toString()]);
    },
    getSelfSparkCount (frames, inputDelay) {
      if (!this.sparkedFrames) {
        return 0;
      }

      const delay = +(inputDelay.split('/')[1]);
      return frames['frame times']
        .filter(time => (this.sparkedFrames[(+time + delay)] || []).length > 0)
        .length;
    },
  },
};
</script>
