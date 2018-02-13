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
            <div v-if="unitData['leader skill']">
              LS Data goes here.
            </div>
            <div v-if="unitData['extra skill']">
              ES Data goes here.
            </div>
            <brave-burst-segment v-if="unitData.bb"
              :burstData="unitData.bb" burstType="Brave Burst">
            </brave-burst-segment>
            <brave-burst-segment v-if="unitData.sbb"
              :burstData="unitData.bb" burstType="Super Brave Burst">
            </brave-burst-segment>
            <brave-burst-segment v-if="unitData.ubb"
              :burstData="unitData.bb" burstType="Ultimate Brave Burst">
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
