<template>
  <v-card class="squad-list--entry-card">
    <v-layout row class="pa-2">
      <v-flex>
        <h1 class="title">
          {{ squad.name }}
        </h1>
      </v-flex>
      <v-spacer/>
      <v-flex style="flex-grow: 0;">
        <h2 class="subheading">
          {{ squadCost }} Cost
        </h2>
      </v-flex>
    </v-layout>
    <v-layout row wrap class="px-2">
      <v-flex
        v-for="(unit, i) in fullUnits"
        :key="getUnitEntryKey(unit, i)"
        xs12 sm6
        class="d-flex py-1"
        style="align-items: center; border: 1px solid var(--background-color-alt);">
        <v-layout :style="`flex-grow: 0!important; min-width: ${thumbnailSize}px; max-width: ${thumbnailSize}px;`" column class="mx-2">
          <v-flex text-xs-center v-if="$vuetify.breakpoint.xsOnly">
            <span class="caption text-no-wrap">{{ unit.position }}</span>
          </v-flex>
          <v-layout align-content-center row>
            <unit-thumbnail
              class="unit-thumbnail"
              :style="`border-color: ${allOrderSettings[i].border};`"
              :isVisible="isVisible"
              :src="getImageUrls(unit.id).ills_battle"
              :rarity="getUnit(unit.id).rarity"
              :imageTitle="getUnit(unit.id).name || unit.id"
              :displayWidth="thumbnailSize" :displayHeight="thumbnailSize">
              <template slot="after-image">
                <text
                  :x="0"
                  :y="thumbnailSize * 0.75">
                  {{ !isNaN(unit.bbOrder) ? unit.bbOrder : '-' }}
                </text>
              </template>
            </unit-thumbnail>
          </v-layout>
          <v-flex class="text-xs-center" v-if="allOrderSettings[i]">
            <span
              v-if="!isVisible"
              class="body-1"
              v-text="allOrderSettings[i].text"/>
            <v-chip
              v-else
              :style="`
                background-color: ${allOrderSettings[i].background};
                color: ${allOrderSettings[i].foreground};
                border-color: ${allOrderSettings[i].border};
              `"
              class="bb-order-chip"
              small>
              <b>{{ allOrderSettings[i].text }}</b>
            </v-chip>
          </v-flex>
        </v-layout>
        <v-layout column style="align-self: flex-start;">
          <!-- name and leader/friend icon -->
          <v-layout align-center>
            <v-flex class="d-flex-container align-center font-weight-bold subheading">
              <span v-if="getUnit(unit.id).rarity < 8">{{ getUnit(unit.id).rarity }}</span>
              <rarity-icon
                v-if="isVisible"
                :class="{ 'ml-1': getUnit(unit.id).rarity !== 8, 'mr-1': true, }"
                :rarity="getUnit(unit.id).rarity || 0"
                :displaySize="18"/>
              <span>{{ getUnit(unit.id).name || unit.id }}</span>
            </v-flex>
            <v-spacer/>
            <v-flex
              v-if="i === squad.lead || i === squad.friend"
              style="flex-grow: 0;">
              <leader-icon
                v-if="i === squad.lead"
                :displaySize="18"/>
              <friend-icon
                v-else-if="i === squad.friend"
                :displaySize="18"/>
            </v-flex>
          </v-layout>
          <!-- extra skill -->
          <v-layout align-center>
            <v-layout style="flex-grow: 0;" align-center justify-center>
              <extra-skill-icon
                v-if="isVisible"
                :inactive="!unit.es"
                :displaySize="22"
                class="mr-1"/>
            </v-layout>
            <v-flex>
              {{ getExtraSkill(unit.es).name || 'No Extra Skill' }}
            </v-flex>
          </v-layout>
          <!-- spheres -->
          <v-layout row wrap align-center>
            <v-layout
              v-for="(sphereId, i) in (unit.spheres.length > 0 ? unit.spheres : ['No Sphere'])"
              :key="`${sphereId}-${i}`"
              align-center>
              <v-layout style="flex-grow: 0;" align-center justify-center>
                <sphere-type-icon
                  v-if="isVisible"
                  :category="getItem(sphereId)['sphere type']"
                  :displaySize="22"
                  class="mr-1"/>
              </v-layout>
              <v-flex>
                {{ getItem(sphereId).name || sphereId }}
              </v-flex>
            </v-layout>
          </v-layout>
          
          <!-- SP -->
          <v-layout v-if="unit.sp && isVisible && getSpCost(unit) > 0">
            <v-flex style="flex-grow: 0;" class="mr-1">
              {{ getSpCost(unit) }} SP:
            </v-flex>
            <v-flex
              v-for="category in getSpCategories(unit)"
              :key="`${category}-${unit.id}-${i}`"
              style="flex-grow: 0;">
              <sp-icon
                :category="category"
                :displaySize="22"/>
            </v-flex>
          </v-layout>
        </v-layout>
      </v-flex>
    </v-layout>
    <v-divider class="mt-2"/>
    <v-card-actions style="justify-content: space-between;">
      <v-btn flat v-if="to" :to="to">View</v-btn>
      <v-btn flat v-else @click="$emit('view')">View</v-btn>
      <v-btn flat @click="$emit('share')">
        <v-icon left>share</v-icon>
        Share
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { unitPositionMapping } from '@/modules/constants';
import { mapGetters, mapState } from 'vuex';
import { spCodeToIndex } from '@/modules/core/units';
import colors from 'vuetify/es5/util/colors';
import UnitThumbnail from '@/components/Multidex/Units/UnitThumbnail';
import RarityIcon from '@/components/Multidex/RarityIcon';
import SphereTypeIcon from '@/components/Multidex/Items/SphereTypeIcon';
import LeaderIcon from '@/components/Multidex/MiniLeaderIcon';
import FriendIcon from '@/components/Multidex/MiniFriendIcon';
import ExtraSkillIcon from '@/components/Multidex/ExtraSkillIcon';
import SpIcon from '@/components/Multidex/Units/SpIcon';

export default {
  components: {
    UnitThumbnail,
    RarityIcon,
    SphereTypeIcon,
    LeaderIcon,
    FriendIcon,
    ExtraSkillIcon,
    SpIcon,
  },
  props: {
    squad: {
      type: Object,
      required: true,
    },
    getUnit: {
      type: Function,
      default: () => ({}),
    },
    getItem: {
      type: Function,
      default: () => ({}),
    },
    getExtraSkill: {
      type: Function,
      default: () => ({}),
    },
    to: {
      type: String,
      default: '',
    },
  },
  computed: {
    ...mapState('settings', ['lightMode']),
    ...mapGetters('units', {
      getImageUrls: 'getImageUrls',
    }),
    thumbnailSize () {
      return 64;
    },
    iconSize () {
      return 22;
    },
    squadCost () {
      return this.squad.units
        .map(({ id }) => this.getUnit(id))
        .reduce((acc, unit) => acc + (+(unit.cost || 0)), 0);
    },
    // fills empty positions with empty values
    fullUnits () {
      return unitPositionMapping.map(position => {
        let unit = this.squad.units.find(unit => unit.position === position);
        if (!unit) { // empty position, so fill it with empty data
          unit = { position, id: '(Empty)' };
        }

        return unit;
      });
    },
    allOrderSettings () {
      return this.fullUnits.map(u => ({
        text: (!isNaN(u.bbOrder) && this.getOrderText(u)) || '-',
        ...this.getColorSetBasedOnBbType((!isNaN(u.bbOrder) && u) || undefined),
      }));
    },
  },
  data () {
    return {
      isVisible: false,
    };
  },
  mounted () {
    this.$emit('register', {
      elem: this.$el,
      squadId: this.squad.id,
      setVisibility: (val) => {
        // only set to true once
        if (val) {
          this.isVisible = true;
          this.$emit('unregister', { squadId: this.squad.id });
        }
      },
    });
  },
  beforeDestroy () {
    this.$emit('unregister', { elem: this.$el, squadId: this.squad.id });
  },
  methods: {
    getUnitEntryKey (unit = {}, i = 0) {
      return `${JSON.stringify(unit)}-${i}`;
    },
    getColorSetBasedOnBbType (unit = {}) {
      const colorKey = (unit.bbType === 'ubb' && 'red') ||
        (unit.bbType === 'sbb' && 'amber') ||
        'blueGrey';
      
      return {
        border: colors[colorKey].base,
        background: colors[colorKey].lighten4,
        foreground: colors[colorKey].darken4,
      };
    },
    getOrderText (unit = {}) {
      const bbType = unit.bbType ||
        (this.getUnit(unit.id).sbb && 'sbb') ||
        (this.getUnit(unit.id).bb && 'bb') ||
        ('natk');
      return [
        // unit.bbOrder,
        bbType.toUpperCase(),
      ].join('-');
    },
    getSpCategories (unit = {}) {
      const feSkills = this.getUnit(unit.id).feskills;
      const enhancements = unit.sp;
      if (!feSkills || !enhancements) {
        return [];
      }
      const filteredSkills = enhancements.split('')
        .map(char => feSkills[spCodeToIndex(char)])
        .filter(v => v)
        .map(s => +s.category);
      return Array.from(new Set(filteredSkills));
    },
    getSpCost (unit = {}) {
      const feSkills = this.getUnit(unit.id).feskills;
      const enhancements = unit.sp;
      if (!feSkills || !enhancements) {
        return 0;
      }
      return enhancements.split('')
        .map(char => feSkills[spCodeToIndex(char)])
        .filter(v => v)
        .reduce((acc, s) => acc + +s.skill.bp, 0);
    },
  },
};
</script>

<style lang="less">
.squad-list--entry-card {
  .bb-order-chip {
    justify-content: center;
    margin: auto;
    width: 100%;
    border-top-left-radius: 0; 
    border-top-right-radius: 0;
    margin-top: 0;
  }

  image.lazy-actual {
    min-width: 64px;
  }

  .unit-thumbnail {
    flex: 0 1 auto;
    margin: auto;
    font: bold 4.5em sans-serif;
    stroke: black;
    stroke-width: 2px;
    fill: white;
    border: 1px solid white;
  }
}
</style>
