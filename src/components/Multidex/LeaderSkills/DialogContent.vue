<template>
  <dialog-content-base :entry="entry" :loadingEntryData="loadingEntryData">
    <v-container grid-list-lg>
      <v-layout row>
        <v-flex>
          <general-info-card :skill="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
      <v-layout row v-if="entry && entry.associated_units && entry.associated_units.length > 0">
        <v-flex>
          <associated-units-card :skill="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
      <v-layout row v-if="entry && entry.effects && entry.effects.length > 0">
        <v-flex>
          <effects-card :skill="entry" :logger="logger"/>
        </v-flex>
      </v-layout>
    </v-container>
  </dialog-content-base>
</template>

<script>
import DialogContentMixin from '@/components/Multidex/DialogContentMixin';
import GeneralInfoCard from '@/components/Multidex/LeaderSkills/GeneralInfoCard';
import AssociatedUnitsCard from '@/components/Multidex/LeaderSkills/AssociatedUnitsCard';
import EffectsCard from '@/components/Multidex/LeaderSkills/EffectsCard';

export default {
  mixins: [DialogContentMixin],
  components: {
    GeneralInfoCard,
    AssociatedUnitsCard,
    EffectsCard,
  },
};
</script>
