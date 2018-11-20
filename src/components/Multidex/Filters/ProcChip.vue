<template>
  <v-chip v-show="showChip">
    {{ message }}
  </v-chip>
</template>

<script>
import ChipMixin from './FilterChipMixin';

export default {
  mixins: [ChipMixin],
  props: {
    isUnit: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    showChip () {
      return this.requiredFilters.includes('procs') &&
        this.procsArr.length > 0;
    },
    procsArr () {
      return this.filterOptions.procs || [];
    },
    procAreas () {
      return this.filterOptions.procBuffSearchOptions || [];
    },
    message () {
      const countMessage = this.procsArr.length === 1
        ? `Proc [${this.procsArr[0]}]`
        : `${this.procsArr.length} Procs`;

      if (this.isUnit) {
        const areaMessage = `on ${this.procAreas.map(val => val.toUpperCase()).join('/') || 'Nothing'}`;
        return [countMessage, areaMessage].join(' ');
      } else {
        return countMessage;
      }
    },
  },
};
</script>
