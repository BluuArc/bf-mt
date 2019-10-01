<template>
  <base-entry-card :to="to || undefined">
    <v-container fluid class="pa-3">
      <v-layout row>
        <v-flex xs3 class="text-xs-center d-align-self-center pb-0">
          <unit-thumbnail
            :src="getImageUrls(entry.id).ills_thum"
            :rarity="rarity"
            :imageTitle="entry.name"
            :displayWidth="thumbnailSize" :displayHeight="thumbnailSize"/>
        </v-flex>
        <v-flex xs9 class="pb-0">
          <v-container fluid class="pa-0">
            <v-layout row>
              <v-flex>
                <div class="d-flex-container items-center">
                  <element-icon v-if="entry.element" :element="entry.element" :displaySize="20" class="mr-1"/>
                  <h1 class="subheading d-inline-block" style="word-break: break-word;">
                    <b v-text="entry.name || entry.id"/>
                  </h1>
                </div>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs4>
                <h2 class="subheading" style="white-space: nowrap;"># {{ entry.guide_id }}</h2>
              </v-flex>
              <v-flex xs4 class="text-xs-center">
                <v-icon :color="genderIconInfo.color">fas {{ genderIconInfo.icon }}</v-icon>
              </v-flex>
              <v-flex xs4 class="text-xs-right d-align-self-center">
                <div class="d-flex-container items-center content-flex-end">
                  <span v-if="rarity < 8">{{ rarity }}</span>
                  <rarity-icon :class="{ 'ml-1': rarity !== 8 }" :rarity="rarity" :displaySize="18"/>
                </div>
              </v-flex>
            </v-layout>
            <v-layout v-if="sp && getSpCost(entry) > 0">
              <v-flex style="flex-grow: 0;" class="mr-1">
                {{ getSpCost(entry) }} SP:
              </v-flex>
              <v-flex
                v-for="category in getSpCategories(entry)"
                :key="`${category}-${entry.id}`"
                style="flex-grow: 0;">
                <sp-icon
                  :category="category"
                  :displaySize="22"/>
              </v-flex>
            </v-layout>
            <v-layout row wrap v-if="attackChips.length > 0">
              <v-chip
                v-for="(attack, i) in attackChips"
                :key="i"
                small
                style="pointer-events: none;"
                :color="getChipColorConfigForBurstType(attack.burstType).color"
                text-color="white"
                outline
              >
                <v-avatar :class="getChipColorConfigForBurstType(attack.burstType).avatarColor">
                  {{ attack.hits }}
                </v-avatar>
                {{ attack.label }}
              </v-chip>
            </v-layout>
          </v-container>
        </v-flex>
      </v-layout>
    </v-container>
  </base-entry-card>
</template>

<script>
import { mapGetters } from 'vuex';
import { getGenderInfo } from '@/modules/utils';
import { spCodeToIndex, spCodeToEffects } from '@/modules/core/units';
import { burstTypes } from '@/modules/constants';
import EntryCardMixin from '@/components/Multidex/BaseEntryCardMixin';
import ElementIcon from '@/components/Multidex/ElementIcon';
import RarityIcon from '@/components/Multidex/RarityIcon';
import SpIcon from '@/components/Multidex/Units/SpIcon';
import UnitThumbnail from '@/components/Multidex/Units/UnitThumbnail';

const CHIP_COLOR_MAPPING_BY_BURST_TYPE = {
  bb: {
    color: 'blue-grey',
    avatarColor: 'blue-grey darken-1',
  },
  sbb: {
    color: 'amber darken-3',
    avatarColor: 'amber darken-4',
  },
  ubb: {
    color: 'red darken-3',
    avatarColor: 'red darken-4',
  },
};

export default {
  mixins: [EntryCardMixin],
  props: {
    sp: {
      type: String,
      default: '',
    },
  },
  components: {
    ElementIcon,
    RarityIcon,
    UnitThumbnail,
    SpIcon,
  },
  computed: {
    ...mapGetters('units', ['getImageUrls']),
    BURST_TYPES: () => burstTypes,
    genderIconInfo () {
      return getGenderInfo(this.entry.gender);
    },
    rarity () {
      return this.entry.rarity;
    },
    thumbnailSize () {
      const breakpoint = this.$vuetify.breakpoint;
      if (breakpoint.xlOnly) {
        return 64;
      } else if (breakpoint.mdAndUp) {
        return 56;
      } else {
        return 48;
      }
    },
    attackChips () {
      const { hasBurstAttack, entry } = this;
      return burstTypes.reduce((acc, burstType) => {
        if (hasBurstAttack(burstType)) {
          const attacks = entry.attackInfo[burstType].map(attack => ({
            hits: attack.hits,
            label: `${attack.target}${attack.sourcePath ? ` (${attack.sourcePath})` : ''}`,
            burstType,
          }));
          return acc.concat(attacks);
        } else {
          return acc;
        }
      }, []);
    },
  },
  methods: {
    getChipColorConfigForBurstType (type) {
      return CHIP_COLOR_MAPPING_BY_BURST_TYPE[type] || CHIP_COLOR_MAPPING_BY_BURST_TYPE.bb;
    },
    hasBurstAttack (type) {
      return this.entry.attackInfo &&
        Array.isArray(this.entry.attackInfo[type]) &&
        this.entry.attackInfo[type].length >= 1;
    },
    getSpCategories (unit = {}) {
      const feSkills = unit.feskills;
      const enhancements = this.sp;
      if (!feSkills || !enhancements) {
        return [];
      }

      const filteredSkills = spCodeToEffects(enhancements, feSkills)
        .map(s => +s.category);
      return Array.from(new Set(filteredSkills));
    },
    getSpCost (unit = {}) {
      const feSkills = unit.feskills;
      const enhancements = this.sp;
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
