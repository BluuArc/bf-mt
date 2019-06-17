<template>
  <dialog-content-base
    :entry="entry"
    :loadingEntryData="loadingEntryData"
    type="ls"
  >
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
      <template v-if="entry && entry.effects && entry.effects.length > 0">
        <v-layout row>
          <v-flex>
            <summary-card :skill="entry" :logger="logger"/>
          </v-flex>
        </v-layout>
        <v-layout row>
          <v-flex>
            <effects-card :skill="entry" :logger="logger"/>
          </v-flex>
        </v-layout>
      </template>
    </v-container>
  </dialog-content-base>
</template>

<script>
import DialogContentMixin from '@/components/Multidex/DialogContentMixin';
import GeneralInfoCard from './GeneralInfoCard';
import AssociatedUnitsCard from './AssociatedUnitsCard';
import SummaryCard from './SummaryCard';
import EffectsCard from './EffectsCard';

export default {
  mixins: [DialogContentMixin],
  components: {
    GeneralInfoCard,
    AssociatedUnitsCard,
    SummaryCard,
    EffectsCard,
  },
};
</script>
