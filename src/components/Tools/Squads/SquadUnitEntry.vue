<template>
  <v-flex class="squad-unit-entry" v-bind="$attrs" v-on="$listeners">
    <slot name="before-content"/>
    <div style="display: flex;">
      <v-layout
        column class="mx-2"
        :style="`flex-grow: 0!important; min-width: ${thumbnailSize}px; max-width: ${thumbnailSize}px;`">
        <v-flex text-xs-center v-if="$vuetify.breakpoint.xsOnly">
          <span class="caption text-no-wrap">{{ unit.position }}</span>
        </v-flex>
        <v-layout align-content-center row style="flex-grow: 0">
          <unit-thumbnail
            class="unit-thumbnail"
            :style="`border-color: ${orderSettings.border};`"
            :isVisible="isVisible"
            :src="getImageUrls(unit.id).ills_battle"
            :rarity="rarity"
            :imageTitle="name"
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
        <v-flex class="text-xs-center" v-if="orderSettings">
          <span
            v-if="!isVisible"
            class="body-1"
            v-text="orderSettings.text"/>
          <v-chip
            v-else
            tabindex="-1"
            :style="`
              background-color: ${orderSettings.background};
              color: ${orderSettings.foreground};
              border-color: ${orderSettings.border};
            `"
            class="bb-order-chip"
            small>
            <b>{{ orderSettings.text }}</b>
          </v-chip>
        </v-flex>
      </v-layout>
      <v-layout column style="align-self: flex-start;">
        <!-- name and leader/friend icon -->
        <v-layout align-center>
          <v-flex class="d-flex-container align-center font-weight-bold subheading">
            <span v-if="rarity < 8">{{ rarity }}</span>
            <rarity-icon
              v-if="isVisible"
              :class="{ 'ml-1': rarity !== 8, 'mr-1': true, }"
              :rarity="rarity || 0"
              :displaySize="18"/>
            <span>{{ name }}</span>
          </v-flex>
          <v-spacer/>
          <v-flex
            v-if="isLead || isFriend"
            style="flex-grow: 0;">
            <leader-icon
              v-if="isLead"
              :displaySize="18"/>
            <friend-icon
              v-else-if="isFriend"
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
          <v-flex style="word-break: break-all; text-align: left;">
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
            <v-flex style="text-align: left">
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
            :key="`${category}-${unit.id}-${index}`"
            style="flex-grow: 0;">
            <sp-icon
              :category="category"
              :displaySize="22"/>
          </v-flex>
        </v-layout>
      </v-layout>
    </div>
  </v-flex>
</template>

<script>
import { squadUnitActions } from '@/modules/constants';
import { spCodeToIndex, spCodeToEffects } from '@/modules/core/units';
import { mapGetters } from 'vuex';
import colors from 'vuetify/es5/util/colors';
import UnitThumbnail from '@/components/Multidex/Units/UnitThumbnail';
import RarityIcon from '@/components/Multidex/RarityIcon';
import SphereTypeIcon from '@/components/Multidex/Items/SphereTypeIcon';
import LeaderIcon from '@/components/Multidex/MiniLeaderIcon';
import FriendIcon from '@/components/Multidex/MiniFriendIcon';
import ExtraSkillIcon from '@/components/Multidex/ExtraSkillIcon';
import SpIcon from '@/components/Multidex/Units/SpIcon';
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';

export default {
  mixins: [GettersMixin],
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
    unit: {
      type: Object,
      required: true,
    },
    isLead: {
      type: Boolean,
      default: false,
    },
    isFriend: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    index: {
      type: Number,
      default: -1,
    },
  },
  computed: {
    ...mapGetters('units', {
      getImageUrls: 'getImageUrls',
    }),
    thumbnailSize () {
      return 64;
    },
    iconSize () {
      return 22;
    },
    orderSettings () {
      const hasBbOrder = !isNaN(this.unit.bbOrder);
      return {
        text: (hasBbOrder && this.getOrderText(this.unit)) || '-',
        ...this.getColorSetBasedOnAction((hasBbOrder && this.unit) || undefined),
      };
    },
    rarity () {
      return this.getUnit(this.unit.id).rarity;
    },
    name () {
      return this.getUnit(this.unit.id).name || this.unit.id;
    },
  },
  methods: {
    getColorSetBasedOnAction (unit = {}) {
      const colorKey = (unit.action === squadUnitActions.UBB && 'red') ||
        (unit.action === squadUnitActions.SBB && 'amber') ||
        (unit.action === squadUnitActions.BB && 'blueGrey') ||
        'grey';

      return {
        border: colors[colorKey].base,
        background: colors[colorKey].lighten4,
        foreground: colors[colorKey].darken4,
      };
    },
    getOrderText (unit = {}) {
      // default to SBB or below (depending on if the unit has it)
      const action = unit.action ||
        (this.getUnit(unit.id).sbb && squadUnitActions.SBB) ||
        (this.getUnit(unit.id).bb && squadUnitActions.BB) ||
        (squadUnitActions.ATK);
      return action.toUpperCase();
    },
    getSpCategories (unit = {}) {
      const feSkills = this.getUnit(unit.id).feskills;
      const enhancements = unit.sp;
      if (!feSkills || !enhancements) {
        return [];
      }

      const filteredSkills = spCodeToEffects(enhancements, feSkills)
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
.squad-unit-entry {
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
