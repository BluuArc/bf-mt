<template>
  <dialog-content-base
    :entry="entry"
    :loadingEntryData="loadingEntryData"
    type="unit"
  >
    <v-container class="mb-5 pb-3">
      <v-layout row>
        <v-flex v-if="activeMainTab === 'general'">
          <v-container fluid class="pa-0" grid-list-lg>
            <v-layout row wrap>
              <v-flex xs12 sm6 md3>
                <miscellaneous-card :unit="entry" :logger="logger" style="height: 100%;"/>
              </v-flex>
              <v-flex xs12 sm6 md9>
                <stats-card :unit="entry" :logger="logger" style="height: 100%;"/>
              </v-flex>
            </v-layout>
            <v-layout row v-if="hasUnitEvolutions">
              <v-flex>
                <evolution-card :unit="entry" :logger="logger" :pageDb="pageDb"/>
              </v-flex>
            </v-layout>
            <v-layout row v-if="entry.dictionary">
              <v-flex>
                <dictionary-card :entry="entry" :logger="logger"/>
              </v-flex>
            </v-layout>
            <v-layout row v-if="entry.first_clear_missions">
              <v-flex>
                <first-time-clear-reward-card :entry="entry" :logger="logger"/>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs12 sm6>
                <movement-card :unit="entry" :logger="logger"/>
              </v-flex>
              <v-flex xs12 sm6>
                <arena-card :unit="entry" :logger="logger"/>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
        <v-flex v-else-if="activeMainTab === 'skills'">
          <v-container fluid class="pa-0">
            <v-layout row wrap class="dialog-card-list">
              <v-flex xs12>
                <summary-card :unit="entry" :logger="logger"/>
              </v-flex>
              <v-flex xs12>
                <leader-skill-card :unit="entry" :logger="logger"/>
              </v-flex>
              <v-flex xs12 v-if="entry && entry['extra skill']">
                <extra-skill-card :unit="entry" :logger="logger"/>
              </v-flex>
              <v-flex xs12>
                <burst-card :unit="entry" :logger="logger" burstType="bb" :extraAttacks="extraAttacks.bb"/>
              </v-flex>
              <template v-for="type in ['sbb', 'ubb']">
                <v-flex xs12 v-if="entry && entry[type]" :key="type">
                  <burst-card :unit="entry" :logger="logger" :burstType="type" :extraAttacks="extraAttacks[type]"/>
                </v-flex>
              </template>
              <v-flex v-if="entry && entry.feskills">
                <enhancements-card :unit="entry" :logger="logger"/>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
        <!-- TODO: move flavor text card here -->
        <v-flex v-else-if="activeMainTab === 'art'">
          <v-container fluid class="text-xs-center">
            <img class="unit-image" :src="images.ills_full"/>
            <div v-show="alternateImageLoaded">
              <img
                class="unit-image"
                :src="alternateImages.ills_full"
                @load="alternateImageLoaded = true"
                @error="alternateImageLoaded = false"/>
            </div>
          </v-container>
        </v-flex>
      </v-layout>
    </v-container>
    <v-bottom-nav :value="true" :active.sync="activeMainTab" app color="primary">
      <v-btn
        v-for="tab in mainTabs"
        :key="tab.value"
        :value="tab.value"
        flat class="white--text">
        {{ tab.text }}
        <v-icon v-if="tab.icon">{{ tab.icon }}</v-icon>
      </v-btn>
    </v-bottom-nav>
  </dialog-content-base>
</template>

<script>
import DialogContentMixin from '@/components/Multidex/DialogContentMixin';
import BorderedTitledCard from '@/components/BorderedTitledCard';

import MiscellaneousCard from './MiscellaneousCard';
import StatsCard from './StatsCard';
import DictionaryCard from './DictionaryCard';
import EvolutionCard from './EvolutionCard';
import FirstTimeClearRewardCard from '@/components/Multidex/FirstTimeClearRewardCard';
import MovementCard from './MovementCard';
import ArenaCard from './ArenaCard';

import SummaryCard from './SummaryCard';
import LeaderSkillCard from './LeaderSkillCard';
import ExtraSkillCard from './ExtraSkillCard';
import BurstCard from './BurstCard';
import EnhancementsCard from './EnhancementsCard';

import { getExtraAttacks, hasEvolutions } from '@/modules/core/units';
import { mapGetters } from 'vuex';

export default {
  mixins: [DialogContentMixin],
  components: {
    BorderedTitledCard,
    MiscellaneousCard,
    StatsCard,
    DictionaryCard,
    EvolutionCard,
    FirstTimeClearRewardCard,
    ArenaCard,
    SummaryCard,
    MovementCard,
    LeaderSkillCard,
    ExtraSkillCard,
    BurstCard,
    EnhancementsCard,
  },
  computed: {
    ...mapGetters('units', ['getImageUrls']),
    hasUnitEvolutions () {
      return this.entry && hasEvolutions(this.entry);
    },
    images () {
      return this.getImageUrls(this.entry && this.entry.id);
    },
    alternateImages () {
      return this.getImageUrls(`${this.entry && this.entry.id}_2`);
    },
    mainTabs: () => [
      { text: 'General Info', value: 'general', icon: 'perm_identity' },
      { text: 'Skill Set', value: 'skills', icon: 'category' },
      { text: 'Art', value: 'art', icon: 'insert_photo' },
    ],
    mainTabValues () {
      return this.mainTabs.map(({ value }) => value);
    },
    extraAttacks () {
      return getExtraAttacks(this.entry);
    },
  },
  data () {
    return {
      alternateImageLoaded: false,
      activeMainTab: 0,
    };
  },
  watch: {
    activeMainTab (newValue) {
      // default to middle tab if invalid
      if (!this.mainTabValues.includes(newValue)) {
        this.activeMainTab = this.mainTabValues[1];
      }
    },
  },
  mounted () {
    this.activeMainTab = this.mainTabValues[1];
  },
};
</script>

<style lang="less">
.dialog-card-list {
  & > .flex {
    margin-top: 8px;
    margin-bottom: 8px;
  }
}

img.unit-image {
  max-width: 100%;
}
</style>
