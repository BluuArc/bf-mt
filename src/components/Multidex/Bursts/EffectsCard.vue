<template>
  <description-card-base
    :entry="burst"
    materialColor="green darken-2"
    :titleHtmlGenerator="() => 'Effect Info'"
    :treeOptions="{ maxDepth: 1 }"
    :effectGetter="() => currentBurstEffect"
    :contextHandler="contextHandler"
    :tabNames="['Buff Table', 'Buff List', hasHitCountData && 'Hitcounts'].filter(val => val)">
    <template slot="title">
      <v-layout row wrap>
        <v-flex xs12 sm8 md9 class="text-xs-left">
          <card-title-with-link
            titleHtml="Effect Info"/>
        </v-flex>
        <v-flex xs12 sm4 md3 class="text-xs-right">
          <v-tooltip bottom>
            <span slot="activator" style="border-bottom: 1px dotted;" class="body-1">
              {{ bcdcInfo.cost }} BC/{{ bcdcInfo.hits }} {{ bcdcInfo.hits === 1 ? 'Hit' : 'Hits' }}/{{ bcdcInfo.dropchecks }} DC
            </span>
            <span>
              BC required to fill gauge / Hits on burst / Total BC Dropchecks
            </span>
          </v-tooltip>
        </v-flex>
      </v-layout>
    </template>
    <template slot="buff-table">
      Buff Table
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
    <template slot="buff-list">
      Buff List
    </template>
  </description-card-base>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import CardTitleWithLink from '@/components/CardTitleWithLink';
import BuffTable from '@/components/Multidex/BuffTable/MainTable';
import HitCountTable from '@/components/Multidex/HitCountTable';
import * as burstHelpers from '@/modules/core/bursts';

export default {
  props: {
    burst: {
      type: Object,
    },
    logger: {
      required: true,
    },
  },
  components: {
    DescriptionCardBase,
    CardTitleWithLink,
    BuffTable,
    HitCountTable,
  },
  computed: {
    ...mapState('units', ['pageDb']),
    ...mapGetters('units', ['getMultidexPathTo']),
    bcdcInfo () {
      if (!this.burst) {
        return { cost: 0, hits: 0, dropchecks: 0 };
      }

      return burstHelpers.getBcDcInfo(this.burst);
    },
    numLevels () {
      return this.burst ? this.burst.levels.length : 0;
    },
    currentBurstEffect () {
      return this.burst ? this.burst.levels[this.levelIndex].effects : undefined;
    },
    hasHitCountData () {
      return (Array.isArray(this.hitCountData) && this.hitCountData.length > 0) ||
        (Array.isArray(this.extraAttackHitCountData) && this.extraAttackHitCountData.length > 0);
    },
    associatedUnits () {
      if (!this.burst || !this.burst.associated_units) {
        return [];
      }

      return this.burst.associated_units.map(id => this.pageDb[id]).filter(v => v);
    },
  },
  data: () => ({
    levelIndex: 0,
    hitCountData: null,
    sparkedFrames: null,
    extraAttackHitCountData: null,
    extraAttacks: [],
    burstType: 'bb',
  }),
  watch: {
    burst: {
      deep: true,
      async handler () {
        await this.calculateBurstData();
      },
    },
  },
  async mounted () {
    this.levelIndex = (this.numLevels === 0) ? 0 : (this.numLevels - 1);
    if (this.burst) {
      await this.calculateBurstData();
    }
  },
  methods: {
    ...mapActions('units', {
      getUnit: 'getById'
    }),
    async setBurstType () {
      this.burstType = 'bb';
      if (!this.burst || !this.burst.associated_units) {
        return;
      }

      const unit = await this.getUnit(this.burst.associated_units[0]);
      const burstId = this.burst.id.toString();
      const { sbb = {}, ubb = {} } = unit;
      if (sbb.id && sbb.id.toString() === burstId) {
        this.burstType = 'sbb';
      } else if (ubb.id && ubb.id.toString() === burstId) {
        this.burstType = 'ubb';
      } else {
        this.burstType = 'bb';
      }
    },
    contextHandler (effect, index) {
      return {
        damageFrames: this.burst['damage frames'][index],
      };
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
    async calculateBurstData () {
      this.hitCountData = null;
      
      await this.setBurstType();

      const hitCountData = burstHelpers.getHitCountData(this.burst);
      this.extraAttackHitCountData = await burstHelpers.getExtraAttackHitCountData(this.burst, this.extraAttacks, this.burstType !== 'ubb' && this.associatedUnits.length > 0);
      this.sparkedFrames = await burstHelpers.calculateSparkedFrames(hitCountData, this.extraAttackHitCountData);

      this.hitCountData = hitCountData;
    },
  },
};
</script>
