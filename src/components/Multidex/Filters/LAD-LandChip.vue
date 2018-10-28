<template>
  <v-chip v-show="showChip">
    {{ message }}
  </v-chip>
</template>

<script>
import ChipMixin from './FilterChipMixin';

export default {
  mixins: [ChipMixin],
  computed: {
    showChip () {
      return this.requiredFilters.includes('land') &&
        this.filterArr.length > 0;
    },
    filterArr () {
      return this.filterOptions.land || [];
    },
    message () {
      return this.filterArr.length === 1
        ? `Land: ${this.filterArr[0]}`
        : `${this.filterArr.length} Lands`;
    },
  },
};
</script>
