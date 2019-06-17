<template>
  <base-summary-card
    :entry="item"
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
import { getEffectsListForItem } from '@/modules/core/items';
import BaseSummaryCard from '@/components/Multidex/BaseSummaryCard';

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  components: {
    BaseSummaryCard,
  },
  computed: {
    buffSources () {
      return [{ item: this.item }];
    },
  },
  methods: {
    getEffectsFromSource ({ item } = {}, target, effectType) {
      return getEffectsListForItem({
        item,
        target,
        effectType,
      });
    },
    getHeaderTextForSource ({ item } = {}) {
      return item.name || item.id;
    },
  },
};
</script>
