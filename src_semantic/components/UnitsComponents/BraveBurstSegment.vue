<template>
  <div class="ui raised segments" v-if="burstData && !burstData.error">
    <div :class="getHeaderClass()">
      <div class="ui grid two column">
        <div class="column">
          <b>{{ burstType }}: </b>{{ burstData.name }}
        </div>
        <div class="column right aligned" v-html="bcdcInfo"/>
      </div>
    </div>
    <div class="ui segment" id="burst-content">
      <div class="ui top attached tabular menu">
        <a class="active item"
          :data-tab="descriptionTabId">
          Description
        </a>
        <a
          class="item"
          :data-tab="hitcountTabId"
          v-if="hasHitCounts">
          Hitcounts
        </a>
        <a
          class="item"
          :data-tab="jsonTabId">
          JSON
        </a>
      </div>
      <div
        class="ui bottom attached active tab segment"
        :data-tab="descriptionTabId">
        <p>{{ burstData.desc }}</p>
      </div>
      <div
        class="ui bottom attached tab segment"
        v-if="hasHitCounts"
        :data-tab="hitcountTabId">
        <div
          v-for="(attack, attackIndex) in hitCountData"
          :key="attackIndex">
          <h3 v-if="hitCountData.length > 1">Attack #{{ attackIndex + 1 }}</h3>
          <hitcount-table :attack="attack"/>
        </div>
      </div>
      <div
        class="ui bottom attached tab segment"
        :data-tab="jsonTabId">
        <json-viewer :json="burstData"/>
      </div>
    </div>
  </div>
</template>

<script>
import JsonViewer from '@/components/JsonViewer';
import HitCountTable from '@/components/UnitsComponents/HitCountTable';

/* global $ */
export default {
  props: ['burstData', 'burstType'],
  components: {
    'json-viewer': JsonViewer,
    'hitcount-table': HitCountTable,
  },
  watch: {
    burstData() {
      setTimeout(() => {
        this.initTabs();
      }, 50);
    },
  },
  mounted() {
    this.initTabs();
  },
  data() {
    return {
      typeColorMapping: {
        BB: 'grey',
        SBB: 'yellow',
        UBB: 'red',
      },
    };
  },
  computed: {
    descriptionTabId() {
      return `desc-${this.burstType}`;
    },
    hitcountTabId() {
      return `hitcount-${this.burstType}`;
    },
    jsonTabId() {
      return `json-${this.burstType}`;
    },
    attackingProcs: () => ['1', '13', '14', '27', '28', '29', '47', '61', '64', '75', '11000'].concat(['46', '48', '97']),
    hitCountData() {
      const attackData = this.burstData['damage frames']
        .filter(f => this.attackingProcs.indexOf(f['proc id'].toString()) > -1);

      return attackData;
    },
    hasHitCounts() {
      return this.hitCountData.length > 0;
    },
    bcdcInfo() {
      const endLevel = this.burstData.levels[this.burstData.levels.length - 1];

      const attacks = endLevel.effects
        .map((e, i) => ({
          'proc id': e['proc id'],
          hits: e.hits || this.burstData['damage frames'][i].hits || 0,
        })).filter(e => this.attackingProcs.indexOf(e['proc id']) > -1);
      const numHits = attacks.reduce((acc, val) => (acc + +val.hits), 0);

      const dropChecks = numHits * +this.burstData['drop check count'];

      return [
        `<abbr title="BC required to fill BB gauge">${endLevel['bc cost']} BC</abbr>`,
        `<abbr title="Hits on ${this.burstType}">${numHits} ${numHits === 1 ? 'Hit' : 'Hits'}</abbr>`,
        `<abbr title="total BC dropchecks">${dropChecks} DC</abbr>`,
      ].join('/');
    },
  },
  methods: {
    getHeaderClass() {
      const classObject = { ui: true, inverted: true, segment: true };
      classObject[this.typeColorMapping[this.burstType]] = true;
      return classObject;
    },
    initTabs() {
      $(this.$el).find('.menu .item')
        .tab({
          context: $(this.$el),
        })
        .tab('change tab', this.descriptionTabId);
    },
  },
};
</script>

<style>
#burst-content .bottom.attached.tab.segment {
  max-height: 60vh;
  overflow: auto;
}
</style>
