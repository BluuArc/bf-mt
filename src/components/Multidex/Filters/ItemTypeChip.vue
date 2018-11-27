<template>
  <v-chip v-show="showChip">
    <span v-if="typeArr.length === 0">
      No Item Types
    </span>
    <span v-else-if="typeArr.length === 1" class="d-flex d-align-self-center">
      {{ itemTypeMapping[typeArr[0]] }}s Only
    </span>
    <span v-else>
      {{ typeArr.length }} Item Types
    </span>
  </v-chip>
</template>

<script>
import ChipMixin from './FilterChipMixin';
import { itemTypes, itemTypeMapping } from '@/modules/constants';

export default {
  mixins: [ChipMixin],
  computed: {
    showChip () {
      return this.requiredFilters.includes('itemTypes') &&
        this.typeArr.length < itemTypes.length;
    },
    typeArr () {
      return this.filterOptions.itemTypes;
    },
    itemTypeMapping: () => itemTypeMapping,
  },
};
</script>
