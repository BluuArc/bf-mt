<template>
  <div>
    <div class="ui longer modal">
      <i class="close icon"></i>
      <div class="header">
        <img class="ui avatar image" :src="getImageURL(unitData.id).ills_battle">
        <span>{{ unitData.guide_id }}: {{ unitData.name }} ({{ unitData.id }})</span>
      </div>
      <div class="scrolling content">
        <div class="ui container fluid" id="full-art-container">
          <img class="ui centered image" :src="getImageURL(unitData.id).ills_full || ''">
        </div>
        <div class="ui container fluid" id="content-container">
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
            <div class="ui raised segments">
              <div class="ui blue inverted segment">
                Things to Eventually Add
              </div>
              <div class="ui segment">
                <ul>
                  <li>SP enhancements (if applicable)</li>
                  <li>buff translations for LS/ES/BB/SBB/UBB/SP</li>
                  <ul><li>Buff viewer (overall and specific skills)</li></ul>
                  <li>some way to show hit distributions for NAtk/BB/SBB/UBB</li>
                  <li>Lore?</li>
                  <li>Server Switch for Server-Specific variants</li>
                  <li>Animation viewer</li>
                  <li>Arena AI</li>
                  <li>Stat viewer (star plot?)</li>
                </ul>
              </div>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import BraveBurstSegment from '@/components/UnitsComponents/BraveBurstSegment';
import { storeMethods } from '@/store';

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
      return id ? storeMethods.getUnitImageURLs(this.$store.state, id) : {};
    },
  },
};
</script>

<style>
#full-art-container {
  max-height: 300px;
}

#full-art-container img {
  max-height: 300px;
  width: auto;
}

.ui.modal>.scrolling.content {
  max-height: calc(70vh);
  overflow: auto;
}
</style>
