<template>
  <div class="ui raised segments" v-if="burstData && !burstData.error">
    <div :class="getHeaderClass()"><b>{{ burstType }}: </b>{{ burstData.name }}</div>
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
        {{ burstData.desc }}
      </div>
      <div
        class="ui bottom attached tab segment"
        v-if="hasHitCounts"
        :data-tab="hitcountTabId">
        <div
          v-for="(attack, attackIndex) in hitCountData"
          :key="attackIndex">
          <h3 v-if="hitCountData.length > 1">Attack #{{ attackIndex + 1 }}</h3>
          <table class="ui striped compact unstackable table">
            <thead>
              <tr>
                <th class="center aligned">Hit #</th>
                <th class="center aligned">Frame #</th>
                <th class="center aligned">DMG%/hit</th>
                <th class="center aligned">Time Diff</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(frame, frameIndex) in attack['frame times']"
                :key="frameIndex">
                <td class="center aligned">
                  {{ frameIndex + 1 }}
                </td>
                <td class="center aligned">
                  {{ frame }}
                </td>
                <td class="center aligned">
                  {{ attack['hit dmg% distribution'][frameIndex] }}
                </td>
                <td class="center aligned" v-if="frameIndex === 0">0</td>
                <td class="center aligned" v-else>
                  {{ frame - attack['frame times'][frameIndex - 1] }}
                </td>
              </tr>
            </tbody>
          </table>
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

/* global $ */
export default {
  props: ['burstData', 'burstType'],
  components: {
    'json-viewer': JsonViewer,
  },
  mounted() {
    $(this.$el).find('.menu .item')
      .tab({
        context: $(this.$el),
      })
      .tab('change tab', this.descriptionTabId);
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
    hitCountData() {
      const attackingProcs = ['1', '13', '14', '27', '28', '29', '47', '61', '64', '75', '11000'].concat(['46', '48', '97']);
      const attackData = this.burstData['damage frames']
        .filter(f => attackingProcs.indexOf(f['proc id']) > -1);

      return attackData;
    },
    hasHitCounts() {
      return this.hitCountData.length > 0;
    },
  },
  methods: {
    getHeaderClass() {
      const classObject = { ui: true, inverted: true, segment: true };
      classObject[this.typeColorMapping[this.burstType]] = true;
      return classObject;
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
