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
      return this.requiredFilters.includes('area') &&
        this.filterArr.length > 0;
    },
    filterArr () {
      return this.filterOptions.area || [];
    },
    message () {
      return this.filterArr.length === 1
        ? `Area: ${this.filterArr[0]}`
        : `${this.filterArr.length} Areas`;
    },
  },
};
</script>
