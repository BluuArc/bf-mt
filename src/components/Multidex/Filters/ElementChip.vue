<template>
  <v-chip v-show="showChip">
    <span v-if="elementsArr.length === 0">
      No Elements
    </span>
    <span v-else class="d-align-self-center" style="display: flex;">
      <element-icon v-for="element in elementsArr" :element="element" :key="element" :displaySize="16"/>
      <span v-if="elementsArr.length === 1" class="pl-1">Only</span>
    </span>
  </v-chip>
</template>

<script>
import ChipMixin from './FilterChipMixin';
import { elements } from '@/modules/constants';
import ElementIcon from '@/components/Multidex/ElementIcon';

export default {
  mixins: [ChipMixin],
  components: {
    ElementIcon,
  },
  computed: {
    showChip () {
      return this.requiredFilters.includes('elements') &&
        this.elementsArr.length < elements.length;
    },
    elementsArr () {
      return this.filterOptions.elements || [];
    },
  },
};
</script>
