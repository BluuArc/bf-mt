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
      <v-layout row wrap>
        <v-flex xs12 :md6="hasMimics" v-if="entry && entry.requires">
          <requirements-card :mission="entry" :logger="logger" :isThin="hasMimics"/>
        </v-flex>
        <v-flex xs12 :md6="(entry && entry.requires)" v-if="hasMimics">
          <mimic-card :mission="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex>
          <related-missions-card :mission="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
    </v-container>
  </dialog-content-base>
</template>

<script>
import DialogContentMixin from '@/components/Multidex/DialogContentMixin';
import DescriptionCard from '@/components/Multidex/Missions/DescriptionCard';
import MiscellaneousCard from '@/components/Multidex/Missions/MiscellaneousCard';
import RewardsCard from '@/components/Multidex/Missions/RewardsCard';
import RequirementsCard from '@/components/Multidex/Missions/RequirementsCard';
import MimicCard from '@/components/Multidex/Missions/MimicCard';
import RelatedMissionsCard from '@/components/Multidex/Missions/RelatedMissionsCard';

export default {
  mixins: [DialogContentMixin],
  components: {
    DescriptionCard,
    MiscellaneousCard,
    RewardsCard,
    RequirementsCard,
    MimicCard,
    RelatedMissionsCard,
  },
  computed: {
    hasMimics () {
      return this.entry && this.entry.mimic_info && Object.keys(this.entry.mimic_info).length > 0;
    },
  },
};
</script>
