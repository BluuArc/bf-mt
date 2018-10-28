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
      return this.requiredFilters.includes('dungeon') &&
        this.filterArr.length > 0;
    },
    filterArr () {
      return this.filterOptions.dungeon || [];
    },
    message () {
      return this.filterArr.length === 1
        ? `Dungeon: ${this.filterArr[0]}`
        : `${this.filterArr.length} Dungeons`;
    },
  },
};
</script>
