<template>
  <v-chip v-show="showChip">
    <span v-if="kindsArr.length === 0">
      No Unit Types
    </span>
    <span v-else-if="kindsArr.length === 1">
      {{ kindsArr[0] }} Only
    </span>
    <span v-else>
      {{ kindsArr.length }} Unit Types
    </span>
  </v-chip>
</template>

<script>
import ChipMixin from './FilterChipMixin';
import { unitKinds } from '@/modules/constants';

export default {
  mixins: [ChipMixin],
  computed: {
    showChip () {
      return this.requiredFilters.includes('unitKinds') &&
        this.kindsArr.length < unitKinds.length;
    },
    kindsArr () {
      return this.filterOptions.unitKinds || [];
    },
  },
};
</script>
