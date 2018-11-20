<template>
  <v-chip v-show="showChip">
    <span v-if="typeArr.length === 0">
      No Sphere Types
    </span>
    <span v-else class="d-align-self-center" style="display: flex;">
      <sphere-type-icon v-for="(type, i) in typeArr" :key="i" :category="type" :displaySize="20"/>
      <span v-if="typeArr.length === 1" class="pl-1">Only</span>
    </span>
  </v-chip>
</template>

<script>
import ChipMixin from './FilterChipMixin';
import SphereTypeIcon from '@/components/Multidex/Items/SphereTypeIcon';
import { sphereTypeMapping } from '@/modules/constants';

export default {
  mixins: [ChipMixin],
  computed: {
    showChip () {
      return this.requiredFilters.includes('sphereTypes') &&
        this.typeArr.length < Object.keys(sphereTypeMapping).length;
    },
    typeArr () {
      return this.filterOptions.sphereTypes;
    },
  },
  components: {
    SphereTypeIcon,
  },
};
</script>
