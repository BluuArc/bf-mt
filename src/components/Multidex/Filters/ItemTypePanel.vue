<template>
  <v-expansion-panel-content v-if="showPanel">
    <div slot="header">
      <panel-header :hasFilters="hasFilters" title="Item Type"/>
    </div>
    <v-layout row>
      <v-flex class="text-xs-left">
        <v-btn outline class="mr-0" :disabled="disableFilters" @click="value.itemTypes = itemTypes.slice()">All</v-btn>
      </v-flex>
      <v-flex class="text-xs-right">
        <v-btn outline class="ml-0" :disabled="disableFilters" @click="value.itemTypes = []">None</v-btn>
      </v-flex>
    </v-layout>
    <v-layout row wrap class="ml-2 mr-2 pb-3">
      <v-flex xs6 v-for="type in itemTypeCheckboxInputs" :key="type.value" class="text-xs-center">
        <v-checkbox :disabled="disableFilters" :value="type.value" v-model="value.itemTypes" hide-details>
          <div slot="label" class="d-flex">
            {{ type.name }}
          </div>
        </v-checkbox>
      </v-flex>
    </v-layout>
  </v-expansion-panel-content>
</template>

<script>
import FilterPanelMixin from './FilterPanelMixin';
import { itemTypes, itemTypeMapping } from '@/modules/constants';

export default {
  mixins: [FilterPanelMixin],
  computed: {
    filterKey: () => 'itemTypes',
    itemTypes: () => itemTypes,
    itemTypeCheckboxInputs () {
      return itemTypes.map(value => ({ name: itemTypeMapping[value], value }));
    },
  },
};
</script>
