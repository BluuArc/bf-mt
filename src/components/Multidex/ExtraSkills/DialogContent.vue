<template>
  <dialog-content-base :entry="entry" :loadingEntryData="loadingEntryData">
    <v-container grid-list-lg>
      <v-layout row>
        <v-flex>
          <general-info-card :skill="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex>
          <effects-card :skill="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
    </v-container>
  </dialog-content-base>
</template>

<script>
import DialogContentMixin from '@/components/Multidex/DialogContentMixin';
import GeneralInfoCard from '@/components/Multidex/ExtraSkills/GeneralInfoCard';
import EffectsCard from '@/components/Multidex/ExtraSkills/EffectsCard';

export default {
  mixins: [DialogContentMixin],
  components: {
    GeneralInfoCard,
    EffectsCard,
  },
};
</script>
