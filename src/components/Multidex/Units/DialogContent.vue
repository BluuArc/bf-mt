<template>
  <dialog-content-base :entry="entry" :loadingEntryData="loadingEntryData">
    <v-container class="mb-5 pb-3">
      <v-layout row>
        <v-flex v-if="activeMainTab === 'general'">
          <v-container fluid class="pa-0">
            <v-layout row wrap>
              <v-flex xs12 sm6 md3>
                <miscellaneous-card :unit="entry" :logger="logger"/>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
        <v-flex v-else-if="activeMainTab === 'skills'">
          <v-container fluid class="pa-0">
            <v-layout row wrap class="dialog-card-list">
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
        <v-flex v-else-if="activeMainTab === 'art'">
          art tab
          {{ entry }}
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
import LeaderSkillCard from '@/components/Multidex/Units/LeaderSkillCard';
import ExtraSkillCard from '@/components/Multidex/Units/ExtraSkillCard';
import BurstCard from '@/components/Multidex/Units/BurstCard';
import EnhancementsCard from '@/components/Multidex/Units/EnhancementsCard';
import MiscellaneousCard from '@/components/Multidex/Units/MiscellaneousCard';
import { getExtraAttacks } from '@/modules/core/units';

export default {
  mixins: [DialogContentMixin],
  components: {
    BorderedTitledCard,
    LeaderSkillCard,
    ExtraSkillCard,
    BurstCard,
    EnhancementsCard,
    MiscellaneousCard,
  },
  computed: {
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
</style>
