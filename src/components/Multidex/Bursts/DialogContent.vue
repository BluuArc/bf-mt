<template>
  <dialog-content-base
    :entry="entry"
    :loadingEntryData="loadingEntryData"
    type="bb"
  >
    <v-container grid-list-lg>
      <v-layout row>
        <v-flex>
          <general-info-card :burst="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex>
          <summary-card :burst="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex>
          <effects-card :burst="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
    </v-container>
  </dialog-content-base>
</template>

<script>
import DialogContentMixin from '@/components/Multidex/DialogContentMixin';
import SummaryCard from './SummaryCard';
import GeneralInfoCard from './GeneralInfoCard';
import EffectsCard from './EffectsCard';

export default {
  mixins: [DialogContentMixin],
  components: {
    SummaryCard,
    GeneralInfoCard,
    EffectsCard,
  },
};
</script>
