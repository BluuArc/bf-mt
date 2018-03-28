<template>
  <div>
    <div class="ui large modal unit">
      <i class="close icon"></i>
      <div class="header">
        <div class="ui header">
          <img class="ui avatar image" :src="getImageURL(unitData.id).ills_battle">
          <div class="content">
            <span>{{ unitData.guide_id }}: {{ unitData.name }} ({{ unitData.id }})</span>
            <div class="sub header">
              <span
                v-if="unitData.rarity"
                :class="rarityLabelClass">
                {{ unitData.rarity === 8 ? 'OMNI-EVOLUTION' : `${unitData.rarity} STARS` }}
              </span>
              <span
                v-if="unitData.element"
                :class="elementLabelClass">
                {{ unitData.element.toUpperCase() }}
              </span>
              <span
                v-if="unitData.cost"
                class="ui black label">
                {{ unitData.cost }} COST
              </span>
              <span
                v-if="unitData.gender"
                :class="genderLabelClass">
                {{ unitData.gender.toUpperCase() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="scrolling content" id="unit-card-content">
        <div class="ui three item menu top" id="unit-card-menu">
          <a class="item" data-tab="unit-info"><b>General Info</b></a>
          <a class="active item" data-tab="unit-skillset"><b>Skill Set</b></a>
          <a class="item" data-tab="unit-art"><b>Art</b></a>
        </div>

        <div class="ui container tab fluid" id="content-container" data-tab="unit-info">
          <div id="unit-info-bg"></div>
          <stats-segment :stats="unitData.stats" :imps="unitData.imp"/>
          <movement-info-segment
            :drop-checks="unitData['drop check count']"
            :movement-data="unitData.movement"
            :damage-frames="unitData['damage frames']"/>
          <evolution-segment :unit-data="unitData"/>
          <arena-segment :arena="unitData.ai"/>
        </div>

        <div class="ui container active tab fluid" id="content-container" data-tab="unit-skillset">
          <div id="unit-info-bg"></div>
          <leader-skill-segment
            :lsData="unitData['leader skill']"
            v-if="unitData['leader skill']"/>
          <div class="ui raised segments" v-else>
            <div class="ui inverted segment">
              <b>LS: </b>None
            </div>
            <div class="ui segment">No leader skill data found.</div>
          </div>
          <extra-skill-segment
            :esData="unitData['extra skill']"
            v-if="unitData['extra skill']"/>
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
          <enhancements-segment
            :feskillData="unitData.feskills"
            :name="unitData.name"
            v-if="unitData.feskills"/>
          <div class="ui raised segments">
            <div class="ui blue inverted segment">
              Things to Eventually Add
            </div>
            <div class="ui segment">
              <ul>
                <li>JSON Viewer for all parts of data</li>
                <li>buff translations for LS/ES/BB/SBB/UBB/SP</li>
                <ul><li>Buff viewer (overall and specific skills)</li></ul>
                <li>some way to show hit distributions for NAtk/BB/SBB/UBB</li>
                <li>Lore?</li>
                <li>Server Switch for Server-Specific variants</li>
                <li>Animation viewer</li>
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
import LeaderSkillSegment from '@/components/UnitsComponents/LeaderSkillSegment';
import ExtraSkillSegment from '@/components/UnitsComponents/ExtraSkillSegment';
import EnhancementsSegment from '@/components/UnitsComponents/EnhancementsSegment';
import StatsSegment from '@/components/UnitsComponents/StatsSegment';
import EvolutionSegment from '@/components/UnitsComponents/EvolutionSegment';
import ArenaSegment from '@/components/UnitsComponents/ArenaSegment';
import MovementInfoSegment from '@/components/UnitsComponents/MovementInfoSegment';
import { storeMethods } from '@/store';

/* global $ */
export default {
  props: ['unitData'],
  components: {
    'brave-burst-segment': BraveBurstSegment,
    'leader-skill-segment': LeaderSkillSegment,
    'extra-skill-segment': ExtraSkillSegment,
    'enhancements-segment': EnhancementsSegment,
    'stats-segment': StatsSegment,
    'evolution-segment': EvolutionSegment,
    'arena-segment': ArenaSegment,
    'movement-info-segment': MovementInfoSegment,
  },
  data() {
    return {
      unitModal: null,
      cardMenu: null,
    };
  },
  computed: {
    elementLabelClass() {
      const colors = {
        fire: 'red',
        water: 'blue',
        earth: 'green',
        thunder: 'yellow',
        light: 'gray',
        dark: 'purple',
      };

      const labelClass = { 'ui label': true };

      const color = colors[this.unitData.element];

      if (color) {
        labelClass[color] = true;
      }

      return labelClass;
    },
    genderLabelClass() {
      const colors = {
        male: 'blue',
        female: 'pink',
        other: 'grey',
      };

      const labelClass = { 'ui label': true };

      const color = colors[this.unitData.gender];

      if (color) {
        labelClass[color] = true;
      }

      return labelClass;
    },
    rarityLabelClass() {
      const labelClass = { 'ui label': true };

      const rarity = this.unitData.rarity;

      if (rarity < 3) {
        labelClass.grey = true;
      } else if (rarity === 3) {
        labelClass.yellow = true;
      } else if (rarity === 4) {
        labelClass.red = true;
      } else {
        labelClass.rainbow = true;
      }

      return labelClass;
    },
  },
  mounted() {
    this.unitModal = $(this.$el).find('.ui.modal').modal();
    this.cardMenu = $('#unit-card-menu .item')
      .tab({
        context: '.ui.modal.unit',
      }).tab('change tab', 'unit-info');
    $('#content-container #unit-info-bg')
      .css('background-image', `url(${this.getImageURL(this.unitData.id).ills_full})`);
    this.scrollToTop();
  },
  watch: {
    unitData(newValue) {
      // eslint-disable-next-line
      console.debug(newValue);
      if (this.unitModal) {
        this.cardMenu.tab('change tab', 'unit-skillset');
        this.scrollToTop();
        $('#content-container #unit-info-bg')
          .css('background-image', `url(${this.getImageURL(this.unitData.id).ills_full})`);
        setTimeout(() => { this.unitModal.modal('refresh').modal(newValue ? 'show' : 'hide'); }, 75);
      }
    },
  },
  methods: {
    getImageURL(id) {
      return id ? storeMethods.getUnitImageURLs(this.$store.state, id) : {};
    },
    scrollToTop() {
      const $el = $('.scrolling.content#unit-card-content');
      setTimeout(() => {
        $el.get(0).scrollTop = 0;
      }, 250);
    },
  },
};
</script>

<style>
#full-art-container {
  min-height: 150px;
}

#content-container {
  position: relative;
}

#content-container #unit-info-bg{
  background-color: inherit;
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-position: top;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0.25;
}

#enhancements #sp-desc {
  display: inline-table;
}

.ui.modal.unit>.scrolling.content {
  max-height: calc(70vh);
  overflow: auto;
}

.ui.label.rainbow {
  background: linear-gradient(to right, #d32e28, orange, green, #4254da, #b85cfc);
  color: white;
  stroke: black 1px solid;
}
</style>
