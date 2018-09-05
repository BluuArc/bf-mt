<template>
  <v-chip v-show="showChip">
    <span v-if="isTruthy">
      Exclusives Only
    </span>
    <span v-else>
      Non-Exclusives Only
    </span>
  </v-chip>
</template>

<script>
import ChipMixin from './FilterChipMixin';
import { exclusiveFilterOptions } from '@/modules/constants'

export default {
  mixins: [ChipMixin],
  computed: {
    showChip () {
      return this.requiredFilters.includes('exclusives') &&
        !exclusiveFilterOptions.isAll(this.exclusiveFilter);
    },
    exclusiveFilter () {
      return this.filterOptions.exclusives;
    },
    isTruthy () {
      return exclusiveFilterOptions.isTruthy(this.exclusiveFilter);
    },
  },
};
</script>
