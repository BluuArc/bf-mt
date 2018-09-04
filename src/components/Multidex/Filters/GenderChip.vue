<template>
  <v-chip v-show="showChip">
    <span v-if="genderArr.length === 0">
      No Genders
    </span>
    <template v-else>
      <v-icon class="mr-1"
        v-for="gender in genderArr" :key="gender"
        :color="getGenderInfo(gender).color">
          fas {{ getGenderInfo(gender).icon }}
      </v-icon>
      <span v-if="genderArr.length === 1">
        Only
      </span>
    </template>
  </v-chip>
</template>

<script>
import ChipMixin from './FilterChipMixin';
import { genders } from '@/modules/constants';
import { getGenderInfo } from '@/modules/utils';

export default {
  mixins: [ChipMixin],
  computed: {
    showChip () {
      return this.requiredFilters.includes('genders') &&
        this.genderArr.length < genders.length;
    },
    genderArr () {
      return this.filterOptions.genders || [];
    },
  },
  methods: {
    getGenderInfo,
  },
};
</script>
