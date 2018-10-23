<template>
  <dialog-content-base :entry="entry" :loadingEntryData="loadingEntryData">
    <v-container grid-list-lg>
      <v-layout row>
        <v-flex>
          <general-info-card :burst="entry" :logger="logger"/>
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
import GeneralInfoCard from '@/components/Multidex/Bursts/GeneralInfoCard';
import EffectsCard from '@/components/Multidex/Bursts/EffectsCard';

export default {
  mixins: [DialogContentMixin],
  components: {
    GeneralInfoCard,
    EffectsCard,
  },
};
</script>
