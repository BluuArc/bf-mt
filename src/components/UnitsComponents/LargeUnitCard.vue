<template>
  <div id="unit-card-container">
    <div class="ui longer modal">
      <div class="header">{{ unitData.guide_id }}: {{ unitData.name }} ({{ unitData.id }})</div>
      <div class="scrolling content">
        <div class="ui stackable two column grid">
          <div class="column image content">
            <img class="ui centered medium image" :src="getImageURL(unitData.id)">
          </div>
          <div class="column">
            <div class="ui raised segments" v-if="unitData['leader skill']">
              <div class="ui inverted segment">
                <b>LS: </b>{{ unitData['leader skill'].name }}
              </div>
              <div class="ui segment">{{ unitData['leader skill'].desc }}</div>
            </div>
            <div class="ui raised segments" v-else>
              <div class="ui inverted segment">
                <b>LS: </b>None
              </div>
              <div class="ui segment">No leader skill data found.</div>
            </div>
            <div class="ui raised segments" v-if="unitData['extra skill']">
              <div class="ui orange inverted segment">
                <b>ES: </b>{{ unitData['extra skill'].name }}
              </div>
              <div class="ui segment">{{ unitData['extra skill'].desc }}</div>
            </div>
            <brave-burst-segment v-if="unitData.bb"
              :burstData="unitData.bb" burstType="BB">
            </brave-burst-segment>
            <div class="ui raised segments" v-else>
              <div class="ui inverted segment grey"><b>BB: </b>None</div>
              <div class="ui segment">No brave burst data found.</div>
            </div>
            <brave-burst-segment v-if="unitData.sbb"
              :burstData="unitData.sbb" burstType="SBB">
            </brave-burst-segment>
            <brave-burst-segment v-if="unitData.ubb"
              :burstData="unitData.ubb" burstType="UBB">
            </brave-burst-segment>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BraveBurstSegment from '@/components/UnitsComponents/BraveBurstSegment';

/* global $ */
export default {
  props: ['unitData'],
  components: {
    'brave-burst-segment': BraveBurstSegment,
  },
  data() {
    return {
      unitModal: null,
    };
  },
  mounted() {
    this.unitModal = $(this.$el).find('.ui.modal').modal();
  },
  watch: {
    unitData(newValue) {
      // eslint-disable-next-line
      console.log(newValue);
      if (this.unitModal) {
        setTimeout(() => { this.unitModal.modal('refresh').modal(newValue ? 'show' : 'hide'); }, 75);
      }
    },
  },
  methods: {
    getImageURL(id) {
      return id ? `http://dlc.bfglobal.gumi.sg/content/unit/img/unit_ills_full_${id}.png` : '';
    },
  },
};
</script>

<style>
.ui.modal>.scrolling.content {
  max-height: calc(70vh);
  overflow: auto;
}
</style>
