<template>
  <v-expansion-panel-content v-if="showPanel">
    <div slot="header">
      <panel-header :hasFilters="hasFilters" title="Gender"/>
    </div>
    <v-layout row>
      <v-flex class="text-xs-left">
        <v-btn outline class="mr-0" :disabled="disableFilters" @click="value.genders = genders.slice()">All</v-btn>
      </v-flex>
      <v-flex class="text-xs-right">
        <v-btn outline class="ml-0" :disabled="disableFilters" @click="value.genders = []">None</v-btn>
      </v-flex>
    </v-layout>
    <v-layout row wrap class="ml-2 mr-2 pb-3">
      <v-flex xs6 v-for="gender in genders" :key="gender" class="text-xs-center">
        <v-checkbox :disabled="disableFilters" :value="gender" v-model="value.genders" hide-details>
          <div slot="label">
            <v-icon :color="getGenderInfo(gender).color" class="mr-1">fas {{ getGenderInfo(gender).icon }}</v-icon>
            <span style="text-transform: capitalize" v-text="gender"/>
          </div>
        </v-checkbox>
      </v-flex>
    </v-layout>
  </v-expansion-panel-content>
</template>

<script>
import FilterPanelMixin from './FilterPanelMixin';
import { genders } from '@/modules/constants';
import { getGenderInfo } from '@/modules/utils';

export default {
  mixins: [FilterPanelMixin],
  computed: {
    genders: () => genders.slice(),
    filterKey: () => 'genders',
  },
  methods: {
    getGenderInfo,
  },
};
</script>
