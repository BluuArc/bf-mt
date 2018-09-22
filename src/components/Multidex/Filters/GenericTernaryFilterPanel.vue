<template>
  <v-expansion-panel-content v-if="showPanel">
    <div slot="header">
      <panel-header :hasFilters="hasFilters" :title="title"/>
    </div>
    <v-layout row wrap class="ml-2 mr-2 pb-3">
      <v-flex>
        <v-radio-group v-model="value[filterKey]">
          <v-radio
            v-for="(option, i) in options"
            :key="i"
            :disabled="disableFilters"
            :value="option"
            :label="labelMapping[i]"/>
        </v-radio-group>
      </v-flex>
    </v-layout>
  </v-expansion-panel-content>
</template>

<script>
import FilterPanelMixin from './FilterPanelMixin';
import TernaryFilterOption from '@/modules/TernaryFilterOption';

export default {
  mixins: [FilterPanelMixin],
  // props: {
  //   title: {
  //     type: String,
  //     // required: true,
  //   },
  //   filterKey: {
  //     type: String,
  //     // required: true,
  //   },
  //   ternary: {
  //     type: TernaryFilterOption,
  //     // required: true,
  //   },
  //   labelMapping: {
  //     type: Array,
  //     default: () => ['all label', 'truthy label', 'falsy label'],
  //   },
  // },
  computed: {
    options () {
      return this.ternary.valuesArray;
    },
    title: () => 'title',
    filterKey: () => 'key',
    ternary: () => new TernaryFilterOption(),
    labelMapping: () => ['all label', 'truthy label', 'falsy label'],
  },
};
</script>
