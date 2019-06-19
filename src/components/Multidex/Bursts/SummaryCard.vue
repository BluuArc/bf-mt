<template>
  <base-summary-card
    :entry="burst"
    :buffSources="buffSources"
    :getEffectsFromSource="getEffectsFromSource"
  >
    <span slot="allentrypreview">
      <!-- show nothing, as there's only one source -->
    </span>
    <span slot="value-header" slot-scope="{ entry }">
      {{ getHeaderTextForSource(entry) }}
    </span>
  </base-summary-card>
</template>

<script>
import { getEffectsListForBurst } from '@/modules/core/bursts';
import BaseSummaryCard from '@/components/Multidex/BaseSummaryCard';

export default {
  props: {
    burst: {
      type: Object,
      required: true,
    },
  },
  components: {
    BaseSummaryCard,
  },
  computed: {
    buffSources () {
      return [{ burst: this.burst }];
    },
  },
  methods: {
    getEffectsFromSource ({ burst } = {}, target, effectType) {
      return getEffectsListForBurst({
        burst,
        target,
        effectType,
      });
    },
    getHeaderTextForSource ({ burst } = {}) {
      return burst.name || burst.id;
    },
  },
};
</script>
