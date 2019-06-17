<template>
  <dialog-content-base :entry="entry" :loadingEntryData="loadingEntryData">
    <v-container grid-list-lg>
      <v-layout row v-if="hasEffects">
        <v-flex>
          <summary-card :item="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex>
          <general-info-card :item="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex>
          <miscellaneous-card :item="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
      <v-layout row v-if="entry && entry.first_clear_missions">
        <v-flex>
          <first-time-clear-reward-card :entry="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex>
          <usage-card :item="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex>
          <crafting-card :item="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
    </v-container>
  </dialog-content-base>
</template>

<script>
import DialogContentMixin from '@/components/Multidex/DialogContentMixin';
import SummaryCard from './SummaryCard';
import GeneralInfoCard from './GeneralInfoCard';
import MiscellaneousCard from './MiscellaneousCard';
import FirstTimeClearRewardCard from '@/components/Multidex/FirstTimeClearRewardCard';
import UsageCard from './UsageCard';
import CraftingCard from './CraftingCard';
import { getItemEffects } from '@/modules/core/items';

export default {
  mixins: [DialogContentMixin],
  components: {
    SummaryCard,
    GeneralInfoCard,
    MiscellaneousCard,
    FirstTimeClearRewardCard,
    UsageCard,
    CraftingCard,
  },
  computed: {
    hasEffects () {
      return this.entry && getItemEffects(this.entry).length > 0;
    },
  },
};
</script>
