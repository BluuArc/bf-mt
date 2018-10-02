<template>
  <dialog-content-base :entry="entry" :loadingEntryData="loadingEntryData">
    <v-container grid-list-lg>
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
          {{ logger.todo('mission card') || 'TODO: mission card' }}
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex>
          <usage-card :item="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
    </v-container>
  </dialog-content-base>
</template>

<script>
import DialogContentMixin from '@/components/Multidex/DialogContentMixin';
import GeneralInfoCard from '@/components/Multidex/Items/GeneralInfoCard';
import MiscellaneousCard from '@/components/Multidex/Items/MiscellaneousCard';
import UsageCard from '@/components/Multidex/Items/UsageCard';

export default {
  mixins: [DialogContentMixin],
  components: {
    GeneralInfoCard,
    MiscellaneousCard,
    UsageCard,
  },
};
</script>
