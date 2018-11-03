<template>
  <dialog-content-base :entry="entry" :loadingEntryData="loadingEntryData">
    <v-container grid-list-lg>
      <v-layout row wrap>
        <v-flex xs12 sm5>
          <description-card :mission="entry" :logger="logger" style="height: 100%;"/>
        </v-flex>
        <v-flex xs12 sm7>
          <miscellaneous-card :mission="entry" :logger="logger" style="height: 100%;"/>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex>
          <rewards-card :mission="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
      <!-- <v-layout row>
        <v-flex>
          <usage-card :mission="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex>
          <crafting-card :mission="entry" :logger="logger"/>
        </v-flex>
      </v-layout> -->
      <v-layout row>
        {{ entry }}
      </v-layout>
    </v-container>
  </dialog-content-base>
</template>

<script>
import DialogContentMixin from '@/components/Multidex/DialogContentMixin';
import DescriptionCard from '@/components/Multidex/Missions/DescriptionCard';
import MiscellaneousCard from '@/components/Multidex/Missions/MiscellaneousCard';
import RewardsCard from '@/components/Multidex/Missions/RewardsCard';
// import UsageCard from '@/components/Multidex/Items/UsageCard';
// import CraftingCard from '@/components/Multidex/Items/CraftingCard';

export default {
  mixins: [DialogContentMixin],
  components: {
    DescriptionCard,
    MiscellaneousCard,
    RewardsCard,
    // UsageCard,
    // CraftingCard,
  },
};
</script>
