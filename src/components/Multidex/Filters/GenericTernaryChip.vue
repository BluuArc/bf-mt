<template>
  <v-chip v-show="showChip">
    <span v-if="isTruthy">
      {{ truthyLabel }}
    </span>
    <span v-else>
      {{ falsyLabel }}
    </span>
  </v-chip>
</template>

<script>
import ChipMixin from './FilterChipMixin';
import TernaryFilterOption from '@/modules/TernaryFilterOption';

export default {
  mixins: [ChipMixin],
  computed: {
    truthyLabel: () => 'truthy label',
    falsyLabel: () => 'falsy label',
    ternary: () => new TernaryFilterOption(),
    filterKey: () => 'key',
    showChip () {
      return this.requiredFilters.includes(this.filterKey) &&
        !this.ternary.isAll(this.inputFilter);
    },
    inputFilter () {
      return this.filterOptions[this.filterKey];
    },
    isTruthy () {
      return this.ternary.isTruthy(this.inputFilter);
    },
  },
};
</script>
;
