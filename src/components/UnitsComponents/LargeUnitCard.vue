<template>
  <div>
    <div class="ui large modal unit">
      <i class="close icon"></i>
      <div class="header">
        <img class="ui avatar image" :src="getImageURL(unitData.id).ills_battle">
        <span>{{ unitData.guide_id }}: {{ unitData.name }} ({{ unitData.id }})</span>
      </div>
      <div class="scrolling content">
        <div class="ui two item menu top" id="unit-card-menu">
          <a class="active item" data-tab="unit-info"><b>Info</b></a>
          <a class="item" data-tab="unit-art"><b>Art</b></a>
        </div>
        <div class="ui container active tab fluid" id="content-container" data-tab="unit-info">
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
          <div class="ui raised segments" v-if="unitData.feskills">
            <div class="ui green inverted segment">
              <b>SP Enhancements</b>
              <span class="ui small label">
                {{ feskillSum }} SP
              </span>
            </div>
            <div class="ui segment">
              <table
                class="ui very basic green celled compact striped unstackable table"
                id="enhancements">
                <thead>
                  <tr>
                    <th>Cost</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="skill in unitData.feskills" :key="skill.id">
                    <td class="collapsing">
                      {{ skill.skill.bp }} SP
                    </td>
                    <td>
                        <h4 class="ui header">
                          <div class="content">
                            <sp-icon :category="skill.category"></sp-icon>
                            <span id="sp-desc">
                              <div class="header">
                                {{ skill.skill.desc }}
                              </div>
                              <div class="sub header" v-if="skill['dependency comment']">
                                {{ getDependencyText(skill) }}
                              </div>
                            </span>
                        </div>
                      </h4>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="ui raised segments">
            <div class="ui blue inverted segment">
              Things to Eventually Add
            </div>
            <div class="ui segment">
              <ul>
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
        <div class="ui container tab fluid" id="full-art-container" data-tab="unit-art">
          <img class="ui centered image" :src="getImageURL(unitData.id).ills_full || ''">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BraveBurstSegment from '@/components/UnitsComponents/BraveBurstSegment';
import SPIcon from '@/components/UnitsComponents/SPIcon';
import { storeMethods } from '@/store';

/* global $ */
export default {
  props: ['unitData'],
  components: {
    'brave-burst-segment': BraveBurstSegment,
    'sp-icon': SPIcon,
  },
  data() {
    return {
      unitModal: null,
      cardMenu: null,
    };
  },
  mounted() {
    this.unitModal = $(this.$el).find('.ui.modal').modal();
    this.cardMenu = $('#unit-card-menu .item')
      .tab({
        context: '.ui.modal.unit',
      }).tab('change tab', 'unit-info');
    $('#content-container')
      .css('background-image', `url(${this.getImageURL(this.unitData.id).ills_full})`);
    this.scrollToTop();
  },
  watch: {
    unitData(newValue) {
      // eslint-disable-next-line
      console.log(newValue);
      if (this.unitModal) {
        $('#content-container').css('background-image', `url(${this.getImageURL(this.unitData.id).ills_full})`);
        setTimeout(() => { this.unitModal.modal('refresh').modal(newValue ? 'show' : 'hide'); }, 75);
      }
    },
  },
  computed: {
    feskillSum() {
      if (!this.unitData.feskills) {
        return 0;
      }
      return this.unitData.feskills
        .map(s => s.skill.bp)
        .reduce((acc, val) => acc + val, 0);
    },
  },
  methods: {
    getImageURL(id) {
      return id ? storeMethods.getUnitImageURLs(this.$store.state, id) : {};
    },
    getSPSkillWithID(id) {
      const result = this.unitData.feskills
        .filter(s => id.indexOf(s.id.toString()) > -1);

      return result[0];
    },
    getDependencyText(skill) {
      const spSkill = this.getSPSkillWithID(skill.dependency);

      if (spSkill) {
        return `Unlock "${spSkill.skill.desc}"`;
      }

      return skill['dependency comment'] || 'Requires another enhancement';
    },
    scrollToTop() {
      const $el = $('.modal.unit .scrolling.content');
      $el.get(0).scrollTop = 0;
    },
  },
};
</script>

<style>
#full-art-container {
  min-height: 150px;
}

#content-container {
  background-color: inherit;
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-position: center top;
}

#enhancements #sp-desc {
  display: inline-table;
}

.ui.modal>.scrolling.content {
  max-height: calc(70vh);
  overflow: auto;
}
</style>
