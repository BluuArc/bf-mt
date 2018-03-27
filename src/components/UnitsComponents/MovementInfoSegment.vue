<template>
  <div class="ui raised segments" v-if="movementData || damageFrames">
    <div class="ui olive inverted segment">
      <b>Movement Info</b>
    </div>

    <div class="ui segment" id="movement-content">
      <div class="ui top attached tabular menu">
        <a class="active item" data-tab="info-movement">General</a>
        <a v-if="hasHitCounts"
          class="item"
          data-tab="table-movement">
          Hitcounts
        </a>
      </div>

      <div class="ui bottom attached active tab segment" data-tab="info-movement">
        <table class="ui celled unstackable table">
          <thead>
            <tr>
              <th class="center aligned">Attack Type</th>
              <th class="center aligned">Move Speed</th>
              <th class="center aligned">Move Type</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="center aligned"><b>Normal Attack</b></td>
              <td class="center aligned">
                {{ movementData.attack['move speed'] }}
                ({{ movementData.attack['move speed type'] }})
              </td>
              <td class="center aligned">{{ getMoveType(movementData.attack['move type']) }}</td>
            </tr>
            <tr>
              <td class="center aligned"><b>BB/SBB/UBB</b></td>
              <td class="center aligned">
                {{ movementData.skill['move speed'] }}
                ({{ movementData.skill['move speed type'] }})
              </td>
              <td class="center aligned">{{ getMoveType(movementData.skill['move type']) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="ui bottom attached tab segment"
        v-if="hasHitCounts"
        data-tab="table-movement">
        <hitcount-table :attack="damageFrames"/>
      </div>
    </div>
  </div>
</template>

<script>
import HitCountTable from '@/components/UnitsComponents/HitCountTable';

/* global $ */
export default {
  props: ['movementData', 'damageFrames'],
  components: {
    'hitcount-table': HitCountTable,
  },
  watch: {
    damageFrames() {
      setTimeout(() => {
        this.initTabs();
      }, 50);
    },
    movementDate() {
      setTimeout(() => {
        this.initTabs();
      }, 50);
    },
  },
  computed: {
    hasHitCounts() {
      return this.damageFrames && this.damageFrames.hits > 0;
    },
  },
  mounted() {
    this.initTabs();
  },
  methods: {
    initTabs() {
      $(this.$el).find('.menu .item')
        .tab({
          context: $(this.$el),
        })
        .tab('change tab', 'info-movement');
    },
    getMoveType(input) {
      const types = {
        1: 'Moving',
        2: 'Teleporting',
        3: 'Non-Moving',
      };
      return types[+input] || `Unknown Move Type ${input}`;
    },
  },
};
</script>
