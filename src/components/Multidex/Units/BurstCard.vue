<template>
  <description-card-base
    class="burst-card"
    :entry="burst"
    :materialColor="titleColor"
    :titleHtmlGenerator="() => `<b>${burstLabel}: ${name}</b>`"
    :multidexPath="burst && getMultidexPathTo(burst.id) || ''"
    :descriptionGetter="() => description"
    :treeOptions="{ maxDepth: 1 }"
    :effectGetter="() => currentBurstEffect"
    :contextHandler="contextHandler"
    :tabNames="['Description', hasHitCountData && 'Hitcounts', 'JSON', 'Buff List'].filter(val => val)">
    <template slot="title">
      <v-layout row wrap>
        <v-flex xs12 sm8 md9 class="text-xs-left">
          <card-title-with-link
            :multidexPath="burst && getMultidexPathTo(burst.id) || ''"
            :titleHtml="`<b>${burstLabel}: ${name}</b>`"/>
        </v-flex>
        <v-flex xs12 sm4 md3 class="text-xs-right">
          <v-tooltip bottom>
            <span slot="activator" style="border-bottom: 1px dotted;" class="body-1">
              {{ bcdcInfo.cost }} BC/{{ bcdcInfo.hits }} {{ bcdcInfo.hits === 1 ? 'Hit' : 'Hits' }}/{{ bcdcInfo.dropchecks }} DC
            </span>
            <span>
              BC required to fill {{ burstType.toUpperCase() }} gauge / Hits on {{ burstType.toUpperCase() }} / Total BC Dropchecks
            </span>
          </v-tooltip>
        </v-flex>
      </v-layout>
    </template>
    <template slot="description" slot-scope="{ toggleBuffTable, showBuffTable, hasShownBuffTable }">
      {{ description }}
      <template v-if="burst">
        <v-card-actions class="pl-0 pr-0 pb-0">
          <v-btn flat @click="toggleBuffTable">{{ showBuffTable ? 'Hide' : 'Show' }} Buff Table</v-btn>
        </v-card-actions>
        <v-slide-y-transition>
          <div v-show="showBuffTable">
            <v-container fluid v-if="hasShownBuffTable" grid-list-xl>
              <v-layout row>
                <v-flex class="pt-0">
                  <v-divider/>
                </v-flex>
              </v-layout>
              <v-layout row v-if="numLevels > 1">
                <v-flex xs4 md2 class="text-xs-center d-align-self-center">
                  Level: {{ levelIndex + 1 }}
                </v-flex>
                <v-flex>
                  <v-slider v-model="levelIndex" step="1" ticks min="0" :max="numLevels - 1"/>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex>
                  <buff-table :effects="currentBurstEffect" :showHeaders="true"/>
                </v-flex>
              </v-layout>
            </v-container>
          </div>
        </v-slide-y-transition>
      </template>
    </template>
    <template slot="hitcounts">
      <v-expansion-panel v-if="hitCountData">
        <v-expansion-panel-content v-for="(d, i) in hitCountData" :key="i">
          <div slot="header">
            <h2 :class="`title ${$vuetify.breakpoint.xsOnly ? '' : 'd-inline'}`">Attack {{ i + 1 }}</h2>
            <v-chip small>{{ getNumHits(d) }} hit {{ d.target }}</v-chip>
            <v-chip small>{{ d.delay }} delay</v-chip>
            <v-chip v-if="hasSelfSpark(d.frames, d.delay)" small>{{ getSelfSparkCount(d.frames, d.delay) }} Self Sparks</v-chip>
            <v-chip small>{{ getTotalDistribution(d.frames)}}% DMG Distribution</v-chip>
          </div>
          <hit-count-table
            :attack="d.frames" :sparkedFrames="sparkedFrames"
            :attackIndex="i" attackType="native"
            :delay="+(d.delay.split('/')[1])"/>
        </v-expansion-panel-content>
        <v-expansion-panel-content v-for="(d, j) in (extraAttackHitCountData || [])" :key="hitCountData.length + j">
          <div slot="header">
            <h3 :class="`title ${$vuetify.breakpoint.xsOnly ? '' : 'd-inline'}`">Attack {{ hitCountData.length + j + 1 }} - ({{ d.source }})</h3>
            <v-chip small>{{ getNumHits(d) }} hit {{ d.target }}</v-chip>
            <v-chip small>{{ d.delay }} delay</v-chip>
            <v-chip v-if="hasSelfSpark(d.frames, d.delay)" small>{{ getSelfSparkCount(d.frames, d.delay) }} Self Sparks</v-chip>
            <v-chip small>{{ getTotalDistribution(d.frames)}}% DMG Distribution</v-chip>
          </div>
          <hit-count-table
            :attack="d.frames" :sparkedFrames="sparkedFrames"
            :attackIndex="j" attackType="extra"
            :delay="+(d.delay.split('/')[1])"/>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <div v-else>
        No hitcount data found.
      </div>
    </template>
  </description-card-base>
</template>

<script>
import { mapGetters } from 'vuex';
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import CardTitleWithLink from '@/components/CardTitleWithLink';
import BuffTable from '@/components/Multidex/BuffTable/MainTable';
import HitCountTable from '@/components/Multidex/HitCountTable';
import * as burstHelpers from '@/modules/core/bursts';

export default {
  props: {
    unit: {
      type: Object,
    },
    logger: {
      required: true,
    },
    burstType: {
      type: String,
      default: 'bb',
    },
    extraAttacks: {
      default: () => [],
    },
  },
  components: {
    DescriptionCardBase,
    BuffTable,
    CardTitleWithLink,
    HitCountTable,
  },
  computed: {
    ...mapGetters('bursts', ['getMultidexPathTo']),
    burst () {
      return this.unit && this.unit[this.burstType];
    },
    name () {
      return this.burst ? this.burst.name : 'None';
    },
    description () {
      return this.burst ? this.burst.desc : 'None';
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
    currentBurstEffect () {
      return this.burst ? this.burst.levels[this.levelIndex].effects : undefined;
    },
    bcdcInfo () {
      if (!this.burst) {
        return { cost: 0, hits: 0, dropchecks: 0 };
      }

      return burstHelpers.getBcDcInfo(this.burst);
    },
    hasHitCountData () {
      return (Array.isArray(this.hitCountData) && this.hitCountData.length > 0) ||
        (Array.isArray(this.extraAttackHitCountData) && this.extraAttackHitCountData.length > 0);
    },
  },
  data () {
    return {
      levelIndex: 0,
      hitCountData: null,
      sparkedFrames: null,
      extraAttackHitCountData: null,
    };
  },
  watch: {
    burst: {
      deep: true,
      handler () {
        this.calculateBurstData();
      },
    },
  },
  mounted () {
    this.levelIndex = (this.numLevels === 0) ? 0 : (this.numLevels - 1);
    if (this.burst) {
      this.calculateBurstData();
    }
  },
  methods: {
    async calculateBurstData () {
      this.hitCountData = null;

      const hitCountData = burstHelpers.getHitCountData(this.burst);
      this.extraAttackHitCountData = await burstHelpers.getExtraAttackHitCountData(this.burst, this.extraAttacks, this.burstType !== 'ubb');
      this.sparkedFrames = await burstHelpers.calculateSparkedFrames(hitCountData, this.extraAttackHitCountData);

      this.hitCountData = hitCountData;
    },
    hasSelfSpark (frames, inputDelay) {
      return burstHelpers.hasSelfSpark(frames, inputDelay, this.sparkedFrames);
    },
    getSelfSparkCount (frames, inputDelay) {
      return burstHelpers.getSelfSparkCount(frames, inputDelay, this.sparkedFrames);
    },
    getTotalDistribution: burstHelpers.getTotalDistribution,
    getNumHits (hitCountEntry) {
      return (hitCountEntry.frames && (hitCountEntry.frames['frame times'] || hitCountEntry.frames['hit dmg% distribution'] || []).length) || 0;
    },
    contextHandler (effect, index) {
      return {
        damageFrames: this.burst['damage frames'][index],
      };
    },
  },
};
</script>

<style lang="less">
.burst-card {
  .v-expansion-panel__header {
    height: auto;
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
