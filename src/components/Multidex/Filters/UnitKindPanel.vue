<template>
  <v-expansion-panel-content v-if="showPanel">
    <div slot="header">
      <panel-header :hasFilters="hasFilters" title="Unit Type"/>
    </div>
    <v-layout row>
      <v-flex class="text-xs-left">
        <v-btn outline class="mr-0" :disabled="disableFilters" @click="value.unitKinds = unitKinds.slice()">All</v-btn>
      </v-flex>
      <v-flex class="text-xs-right">
        <v-btn outline class="ml-0" :disabled="disableFilters" @click="value.unitKinds = []">None</v-btn>
      </v-flex>
    </v-layout>
    <v-layout row wrap class="ml-2 mr-2 pb-3">
      <v-flex xs6 v-for="kind in unitKinds" :key="kind" class="text-xs-center">
        <v-checkbox :disabled="disableFilters" :value="kind" v-model="value.unitKinds" hide-details>
          <div slot="label">
            <span style="text-transform: capitalize" v-text="kind"/>
          </div>
        </v-checkbox>
      </v-flex>
    </v-layout>
  </v-expansion-panel-content>
</template>

<script>
import FilterPanelMixin from './FilterPanelMixin';
import { unitKinds } from '@/modules/constants';

export default {
  mixins: [FilterPanelMixin],
  computed: {
    unitKinds: () => unitKinds.slice(),
    filterKey: () => 'unitKinds',
  },
};
</script>
